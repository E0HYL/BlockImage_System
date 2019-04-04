import cv2
import numpy as np


class RC4:

    def __init__(self, keystr, dec_filename, enc_filename):
        # 1.密钥 2.等待处理的图片名 3.保存的图片名
        self.key = self.convert_key(keystr)
        self.dec_filename = dec_filename
        self.enc_filename = enc_filename
        self.file_array = cv2.imread(dec_filename)
        # print(self.file_array)
        self.file_list = self.array2list(self.file_array)

    def convert_key(self, s):
        return [ord(c) for c in s]

    def list2array(self, list):
        data_str = np.array(list)
        return data_str.reshape((self.file_array.shape[0],
                                 self.file_array.shape[1], self.file_array.shape[2]))

    def array2list(self, array):
        file_data = np.ndarray.flatten(array)
        # print(max(file_data))
        # print(min(file_data))
        return file_data.tolist()

    def KSA(self):
        keylength = len(self.key)

        S = [i for i in range(256)]

        j = 0
        for i in range(256):
            j = (j + S[i] + self.key[i % keylength]) % 256
            S[i], S[j] = S[j], S[i]  # swap

        return S

    def PRGA(self, S):
        i = 0
        j = 0
        while True:
            i = (i + 1) % 256
            j = (j + S[i]) % 256
            S[i], S[j] = S[j], S[i]  # swap

            K = S[(S[i] + S[j]) % 256]
            yield K

    def process(self):
        S = self.KSA()
        return self.PRGA(S)

    def encrypted(self):
        stream = self.process()
        self.result_list = []
        for c in self.file_list:
            self.result_list.append(c ^ stream.__next__())
        result_array = self.list2array(self.result_list)
        cv2.imwrite(self.enc_filename, result_array)


# if __name__ == '__main__':
#     rc4a = RC4("helloghostthisisapliantext", "author-2.jpg", "encrypted.png")
#     rc4a.encrypted()
#     rc4b = RC4("helloghostthisisapliantext", "encrypted.png", "dec.png")
#     rc4b.encrypted()
#     for i in range(len(rc4a.file_list)):
#         if rc4a.result_list[i] != rc4b.file_list[i]:
#             print(rc4a.result_list[i], rc4b.file_list[i])
