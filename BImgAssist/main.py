# -*- coding: utf-8 -*-
from urllib import request

import binascii

import sm4
import SM2Python
import getkey
import rc4
import os


def genKey():
    prikey = getkey.random_str(64)
    pubkey = SM2Python.SM2GenKey(prikey)
    print("请输入保存公私钥的文件夹, 输入的文件夹不存在则保存在此目录下")
    path = input()
    if os.path.exists(path):
        print(path)
        with open(path + "/pubkey.pem", "w+") as f:  # 以二机制方式追加
            f.write(pubkey)
        with open(path + "/prikey.pem", "w+") as f:  # 以二机制方式追加
            f.write(prikey)
    else:
        with open("pubkey.pem", "w+") as f:  # 以二机制方式追加
            f.write(pubkey)
        with open("prikey.pem", "w+") as f:  # 以二机制方式追加
            f.write(prikey)
    print("公钥保存为pubkey.pem")
    print("私钥保存为prikey.pem")
    print("请保存好您的密钥")


def decrypt():
    print("请输入从平台复制得到的字符串: ")
    str = input()
    bhindex = str.find("密图哈希:")
    ehindex = str.find(',', bhindex)
    bkeyindex = str.find("密钥:")
    ekeyindex = str.find(",", bkeyindex)

    ehash = str[bhindex + 5: ehindex]
    rawkey = str[bkeyindex + 3: ekeyindex]

    url = "https://ipfs.io/ipfs/" + ehash
    imgpath = "enc.png"
    deimgpath = "output.png"

    # with request.urlopen(url) as web:
    #     # 为保险起见使用二进制写文件模式，防止编码错误
    #     with open(imgpath, 'wb') as outfile:
    #         outfile.write(web.read())
    print("请输入您的私钥文件路径:")
    keypath = input()
    if os.path.isfile(keypath):
        with open(keypath, 'r') as f:
            prikey = f.read()
        imgkey = SM2Python.SM2Decrypt(rawkey, prikey)
        rc = rc4.RC4(imgkey, imgpath, deimgpath)
        rc.encrypted()
        # sm4_d = sm4.Sm4()
        # sm4_d.sm4_set_key(imgkey, 1)  # 解密
        # sm4_d.sm4_crypt_ecb(imgpath, deimgpath)
        os.remove(imgpath)
        print("图片解密完成，您的原图为output.png")
    else:
        print("您输入的文件不存在")


def strdecrypt():
    print("请输入等待解密的字符")
    encstr = input()
    # bhindex = encstr.find("对方公钥:")
    # ehindex = len(encstr)-1
    # enckey = encstr[bhindex+5: ehindex]
    print("请输入您的私钥文件路径:")
    keypath = input()
    if os.path.isfile(keypath):
        with open(keypath, 'r') as f:
            prikey = f.read()
        strdec = SM2Python.SM2Decrypt(encstr, prikey)
        dec_m = binascii.a2b_hex(strdec)
        print("解密出来的字符串：", dec_m.decode())
    else:
        print("您输入的文件不存在")


def strencrypt():
    s = getkey.varserification()
    print("生成的验证码为：", s)
    ss = binascii.b2a_hex(s.encode()).decode()
    print("请输入待验证方的公钥：")
    spubkey = input()
    if spubkey.isalnum():
        pubkey = spubkey
    else:
        bhindex = spubkey.find("对方公钥：")
        ehindex = len(spubkey)
        pubkey = spubkey[bhindex+5: ehindex]
    print(pubkey)
    str_k = getkey.random_str(64)
    strenc = SM2Python.SM2Encrypt(str_k, pubkey, ss)
    print("加密后的字符串为：")
    print(strenc)


if __name__ == "__main__":
    print("生成非对称加密公私钥请按1")
    print("图片解密请按2")
    print("字符解密请按3")
    print("生成验证码并加密请按4")
    a = input()
    if a == "1":
        genKey()
    elif a == "2":
        decrypt()
    elif a == "3":
        strdecrypt()
    elif a == "4":
        strencrypt()
    else:
        print("请按照要求输入")
    print("按任意键退出...")
    input()
