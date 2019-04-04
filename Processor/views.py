# coding: utf-8

import tornado.websocket
import os
from settings import BASE_DIR
import ipfsapi
import cv2
from script import getkey, getphash, RC4, blind_watermark, gethash, SM2Python, sm4
import pymysql
import time
import datetime

#  sm2的随机数
str_k = "F6000277CA814FFF1D7BA2E499297B0E00F8575DCF5F3480C00FCB7DFFBA743E"

#  允许的图片格式
ALLOWED_EXTENSIONS = set(['png', 'jpg', 'jpeg'])

#  图片加密密钥的长度
LEN = 32

#  数据库连接操作
conn = pymysql.Connect(host='127.0.0.1', port=3306, user='root', password='0502', db='pichash', charset='utf8')
cur = conn.cursor()
insert_table_sql = """\
insert into inf(phash)
 values(%s)
"""
query_sql = """\
select phash from inf
"""

#  ipfs连接
api = ipfsapi.connect('127.0.0.1', 5001)

pubkey_path = os.path.join(BASE_DIR, "file_upload-master/static/key/public.pem")
prikey_path = os.path.join(BASE_DIR, "file_upload-master/static/key/private.pem")


def split_str(filename):
    n = str.rfind(filename, '.')
    if n == -1:
        return ""
    else:
        return filename[n + 1:len(filename)]


def str_time(filename, stime):
    n = str.rfind(filename, '.')
    # return filename[0: n] + stime + '.' + filename[n + 1: len(filename)]
    return stime + '.' + filename[n + 1: len(filename)]


def allowed_file(filename):
    return '.' in filename and \
           split_str(filename) in ALLOWED_EXTENSIONS


class SendContact(tornado.web.RequestHandler):
    def post(self):
        # nickname = self.get_argument("nickname")
        # phone = self.get_argument("phone")
        username = self.get_argument("username")
        id = self.get_argument("id")
        sex = self.get_argument("sex")
        age = self.get_argument("age")
        account = self.get_argument("account")

        str = id + sex + age + username
        hashstr = gethash.md5sum(str.encode())
        # print(type(hashstr))
        sockio = {"function": "confirm", "account": account, "hash": hashstr}
        send_to_all(WsHandler, sockio)

        time.sleep(5)
        self.set_header("Access-Control-Allow-Origin", "*")
        ret = {"flag": 0}
        self.write(ret)


class UploadJobHandler(tornado.web.RequestHandler):
    def post(self):
        file_metas = self.request.files["file"]
        if len(file_metas) <= 0:
            self.write("获取服务器上传文件失败！")

        metas = file_metas[0]
        md5value = self.get_argument("md5value")
        # rawtime = self.get_argument('time')
        t = self.get_argument('time')
        # print(t)
        tempfilename = md5value + ".part"
        newname = os.path.join(BASE_DIR, "file_upload-master/static/upload/"
                               + t + '_' + tempfilename)

        with open(newname, "ab") as f:  # 以二机制方式追加
            f.write(metas["body"])
        self.set_header("Access-Control-Allow-Origin", "*")
        self.write("finished!")

    def get(self, *args, **kwargs):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.write("ok")


class Imgkeydec:
    def __init__(self, imgkey, cpubkey, owner):
        self.imgkey = imgkey
        self.cpubkey = cpubkey
        self.owner = owner
        # print(self.imgkey, self.cpubkey, self.owner)

    def deckey(self):
        #  密钥用server私钥解密再用客户公钥加密
        with open(prikey_path, "r") as prif:  # 以二机制方式追加
            str_prikey = prif.read()
        len(self.imgkey)
        dimgkey = SM2Python.SM2Decrypt(self.imgkey, str_prikey)
        # print(dimgkey)
        cimgkey = SM2Python.SM2Encrypt(str_k, self.cpubkey, dimgkey)
        # print(cimgkey)
        sockio = {"function": "sendKey", "owner": self.owner, "userkey": cimgkey}
        return sockio


class FinishUpload(tornado.web.RequestHandler):
    def post(self, *args, **kwargs):
        md5value = self.get_argument("md5value")  # 原图hash值
        filename = self.get_argument("filename")
        # imagefee = self.get_argument("imagefee")  # 图片的使用价格
        # imgindex = 0
        imgindex = self.get_argument("iIndex")
        print("imgindex", imgindex)
        t = self.get_argument('time')  # 时间戳
        # print(t)
        # print(imagefee)

        path_part = os.path.join(BASE_DIR, "file_upload-master/static/upload/" +
                                 t + '_' + md5value + ".part")
        self.set_header("Access-Control-Allow-Origin", "*")
        self.write("{'data': 'ok'}")

        # 文件检测
        if allowed_file(filename):
            n = str.rfind(filename, '.')
            old_name = os.path.join(BASE_DIR, "file_upload-master/static/upload/" +
                                    t + '_' + md5value + '.' + filename[n + 1: len(filename)])
            # print(old_name)
            os.rename(path_part, old_name)
            ts = datetime.datetime.now()
            handle = blind_watermark.DCT_watermark()
            img = cv2.imread(old_name)
            wmname = os.path.join(BASE_DIR, "file_upload-master/static/panda.png")
            wm = cv2.imread(wmname, cv2.IMREAD_GRAYSCALE)
            _, wm = cv2.threshold(wm, 127, 255, cv2.THRESH_BINARY)
            sim = handle.extract(img, wm)
            tn = datetime.datetime.now()
            print('数字水印检测用时：%s微秒' % (tn-ts).microseconds)
            if sim > 0.7 or sim < 0:
                os.remove(old_name)
                if sim > 0.7:
                    print("检测出水印")
                if sim < 0:
                    print("图片尺寸过小")
                sockio = {"function": "publish", "imgindex": imgindex, "pro": False, "oHash": "",
                          "eHash": "", "wHash": "", "key": ""}
                send_to_all(WsHandler, sockio)
                return
            ts = datetime.datetime.now()
            pic_phash = getphash.pHash(old_name)  # 计算图片的感知hash
            # print(pic_phash)
            tn = datetime.datetime.now()
            print('计算感知哈希用时：%s微秒' % (tn - ts).microseconds)
            cur.execute(query_sql)
            results = cur.fetchall()
            ts = datetime.datetime.now()
            for res in results:
                n = getphash.hamming_distance_with_hash(pic_phash, res[0])
                # print(res, n)
                if n <= 5:
                    os.remove(old_name)
                    print("感知哈希重复")
                    sockio = {"function": "publish", "imgindex": imgindex, "pro": False, "oHash": md5value,
                              "eHash": "", "wHash": "", "key": ""}
                    send_to_all(WsHandler, sockio)
                    return
            tn = datetime.datetime.now()
            print('感知哈希检测用时：%s微秒' % (tn - ts).microseconds)
            ohash = gethash.md5sumfile(old_name)
            print('ohash', ohash)
            print('md5', md5value)
            ts = datetime.datetime.now()
            wmd = handle.embed(img, wm)
            cv2.imwrite(old_name, wmd)
            tn = datetime.datetime.now()
            print('添加水印用时：%s微秒' % (tn - ts).microseconds)
            rest = api.add(old_name)
            water_hash = rest['Hash']  # 加了水印的图片hash值
            print("检测通过，上传成功")
            pickey = getkey.random_str(LEN)
            enc_name = os.path.join(BASE_DIR, "file_upload-master/static/upload/enc_" + t + '_' +
                                    md5value + '.png')
            # print(enc_name, filename)
            ts = datetime.datetime.now()
            rc4 = RC4.RC4(pickey, old_name, enc_name)
            rc4.encrypted()
            tn = datetime.datetime.now()
            print('图像加密用时：%s微秒' % (tn - ts).microseconds)
            # sm4_e = sm4.Sm4()
            # sm4_e.sm4_set_key(pickey, 0)  # 加密
            # sm4_e.sm4_crypt_ecb(old_name, enc_name)

            rest = api.add(enc_name)
            enhash = rest['Hash']  # 加密图片的HASH值
            pic_phash = getphash.pHash(old_name)
            cur.execute(insert_table_sql, pic_phash)
            conn.commit()
            print(water_hash, enhash)
            os.remove(old_name)
            os.remove(enc_name)
            pubf = open(pubkey_path, 'r')
            str_pubkey = pubf.read()
            pubf.close()
            # print(str_k, str_pubkey, pickey)
            pickey = SM2Python.SM2Encrypt(str_k, str_pubkey, pickey)
            # print(pickey)
            sockio = {"function": "publish", "pro": True, "imgindex": imgindex, "oHash": ohash,
                      "eHash": enhash, "wHash": water_hash, "key": pickey}
            send_to_all(WsHandler, sockio)
            return
        else:
            print("图片格式错误")
            sockio = {"function": "publish", "imgindex": imgindex, "pro": False, "oHash": "",
                      "eHash": "", "wHash": "", "key": ""}
            send_to_all(WsHandler, sockio)
            return


def send_to_all(WsHandler, message):
    print('send_to_all')
    for c in WsHandler.clients:
        c.write_message(message)


class WsHandler(tornado.websocket.WebSocketHandler):
    clients = set()

    def open(self):
        self.write_message('{"msg":"Welcome to WebSocket"}')
        self.clients.add(self)
        # send_to_all(self, '{"user":"you have joined"}')
        print(self.clients)

    def on_message(self, message):
        # print(message)
        messagelist = message.split(',')
        print(messagelist[2], messagelist[1], messagelist[0])
        imgkeydec = Imgkeydec(messagelist[2], messagelist[1], messagelist[0])
        sockio = imgkeydec.deckey()
        send_to_all(self, sockio)

    def on_close(self):
        self.clients.remove(self)
        self.write_message('{"msg":"you have left"}')

    def check_origin(self, origin):
        return True
