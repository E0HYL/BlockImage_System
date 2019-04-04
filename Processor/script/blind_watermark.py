# coding=utf-8

import logging
import cv2
import numpy as np

logging.basicConfig(format='%(asctime)s : %(levelname)s : %(message)s', level=logging.INFO)


class BlindWatermark():

    def img_bin(img):
        shape = img.shape
        img = img.flatten()
        bin_img = np.array([1 if img[i] > 0 else 0 for i in range(len(img))])
        bin_img.reshape(shape)
        return bin_img

    @staticmethod  # 静态方法
    def _gene_signature(wm, size, key):
        '''
            提取特征，用来比对是否包含水印的，不用来恢复水印
            wm   : 水印图片
            size ：生成的特征文件大小
            key  ：生产的特征密钥
        '''
        wm = cv2.resize(wm, (size, size))  # 固定水印图片的大小
        shape = wm.shape
        img = wm.flatten()
        # bin_img = np.array(img, np.uint8)
        bin_img = np.array([1 if img[i] == 255 else 0 for i in range(len(img))], np.uint8)
        # print(img.count(0), img.count(255))
        bin_img = bin_img.reshape(shape)
        # print(bin_img.shape)
        return bin_img

    @staticmethod
    def calc_sim(sig1, sig2s):
        max_sim = 0
        # print(sig1)
        # print(sig2s)
        for sig2 in sig2s:
            match_cnt = np.sum(np.equal(np.array(sig1, dtype=np.int), np.array(sig2, dtype=np.int)))
            sim = match_cnt / len(sig1)
            if max_sim < sim:
                temp = sig2
            max_sim = max(max_sim, sim)
        # print(temp.count(0))
        temp = [255 if temp[i] == 1 else 0 for i in range(len(temp))]
        temp_mat = np.array(temp, dtype=np.uint8)
        n = int(np.sqrt(len(temp)))
        # temp_mat = cv2.resize(temp_mat, (n, n))
        temp_mat = temp_mat.reshape((n, n))
        return temp_mat, max_sim

    def inner_embed(self, B, signature):
        # print("hello")
        pass

    def inner_extract(self, B, signature):
        pass

    def embed(self, ori_img, wm, key=10):
        B = ori_img
        if len(ori_img.shape) > 2:
            img = cv2.cvtColor(ori_img, cv2.COLOR_BGR2YUV)
            signature = self._gene_signature(wm, 64, key).flatten()
            B = img[:, :, 0]  # 取Y平面
        w, h = B.shape[:2]
        if w < 64 or h < 64:
            print('原始图像的长度或者宽度小于 64 pixel.不能嵌入，返回原图.')
            return 0

        if len(ori_img.shape) > 2:
            # print(img)
            img[:, :, 0] = self.inner_embed(B, signature)
            ori_img = cv2.cvtColor(img, cv2.COLOR_YUV2BGR)
        else:
            ori_img = B
        return ori_img

    def extract(self, ori_wmimage, wm, key=10):
        B = ori_wmimage
        if len(ori_wmimage.shape) > 2:
            (B, G, R) = cv2.split(cv2.cvtColor(ori_wmimage, cv2.COLOR_BGR2YUV))
        w, h = B.shape[:2]
        if w < 64 or h < 64:
            print('原始图像的长度或者宽度小于 64 pixel.不能嵌入和提取')
            return -1
        signature = self._gene_signature(wm, 64, key).flatten()
        # handle = DCT_watermark()
        ext_sig = self.inner_extract(B, signature)
        mat, sim = self.calc_sim(signature, ext_sig)
        return sim


class DCT_watermark(BlindWatermark):
    def __init__(self):
        self.Q = 10
        self.size = 2
        self.gap = 20

    # 把所有信息嵌入到 64×64 的方块里 （可以嵌入很多地方）
    # 嵌入到是高频区域，高频反应的是图像的边缘等细节信息，但是'文档截图'的边缘是黑白的，嵌入任何信息都导致不可见性差。
    # 如果嵌入到低频区域，问题失真更大。
    def inner_embed(self, B, signature):
        # print("embed")
        sig_size = np.int(np.sqrt(len(signature)))  # 64
        size = self.size  # 2
        gap = self.gap

        # 四个拐角最多嵌入四份，可用于检测边缘切割和旋转
        # 嵌入水印的时候以2px为单位间隔嵌入

        w, h = B.shape[:2]  # w:行数  h:列数
        # embed_pos：水印开始嵌入点的坐标，四个对应图像的四个角
        embed_pos = [(gap, gap)]
        if w > 2 * sig_size * size + gap * 2:
            embed_pos.append((w - sig_size * size - gap, gap))
        if h > 2 * sig_size * size + gap * 2:
            embed_pos.append((gap, h - sig_size * size - gap))
        if len(embed_pos) == 3:
            embed_pos.append((w - sig_size * size - gap, h - sig_size * size - gap))

        for x, y in embed_pos:
            for i in range(x, x + sig_size * size, size):
                for j in range(y, y + sig_size * size, size):
                    v = np.float32(B[i:i + size, j:j + size])
                    v = cv2.dct(v)
                    # print(v)
                    v[size - 1, size - 1] = self.Q * signature[((i - x) // size) * sig_size + (j - y) // size]
                    v = cv2.idct(v)
                    maxium = max(v.flatten())
                    minium = min(v.flatten())
                    if maxium > 255:
                        v = v - (maxium - 255)
                    if minium < 0:
                        v = v - minium
                    B[i:i + size, j:j + size] = v
        return B

    def inner_extract(self, B, signature):
        # print("extract")
        sig_size = np.int(np.sqrt(len(signature)))
        size = self.size
        gap = self.gap

        ext_sigs = []
        # 检测四个角的，并且检测旋转后的
        # 四个拐角最多嵌入四份，可用于检测边缘切割和旋转

        w, h = B.shape[:2]
        embed_pos = [(gap, gap)]
        embed_pos.append((w - sig_size * size - gap, gap))
        embed_pos.append((gap, h - sig_size * size - gap))
        embed_pos.append((w - sig_size * size - gap, h - sig_size * size - gap))

        for x, y in embed_pos:
            ext_sig = np.zeros(len(signature), dtype=np.int)

            for i in range(x, x + sig_size * size, size):
                for j in range(y, y + sig_size * size, size):
                    v = cv2.dct(np.float32(B[i:i + size, j:j + size]))
                    if v[size - 1, size - 1] > self.Q / 2:
                        ext_sig[((i - x) // size) * sig_size + (j - y) // size] = 1

            ext_sigs.append(ext_sig)
            ext_sig_arr = np.array(ext_sig).reshape((sig_size, sig_size))
            ext_sigs.append(np.rot90(ext_sig_arr, 1).flatten())
            ext_sigs.append(np.rot90(ext_sig_arr, 2).flatten())
            ext_sigs.append(np.rot90(ext_sig_arr, 3).flatten())
        # print(len(ext_sigs))

        return ext_sigs

