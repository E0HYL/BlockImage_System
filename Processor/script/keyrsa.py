# -*- coding: utf-8 -*-

from Crypto import Random
from Crypto.Cipher import PKCS1_v1_5 as Cipher_pkcs1_v1_5
from Crypto.PublicKey import RSA
import base64


class keyrsa:
    def encrypt(self, pubkey, str, flag):
        #  公钥在文件中存储
        if flag == 0:
            with open(pubkey) as f:
                key = f.read()
                rsakey = RSA.importKey(key)
                cipher = Cipher_pkcs1_v1_5.new(rsakey)
                cipher_text = base64.b64encode(cipher.encrypt(str.encode()))
                return cipher_text.decode()
        # 公钥以字符串传入
        else:
            rsakey = RSA.importKey(pubkey)
            cipher = Cipher_pkcs1_v1_5.new(rsakey)
            cipher_text = base64.b64encode(cipher.encrypt(str.encode()))
            return cipher_text.decode()

    def decrypt(self, prikey_path, str):
        with open(prikey_path) as f:
            key = f.read()
            random_generator = Random.new().read
            rsakey = RSA.importKey(key)
            cipher = Cipher_pkcs1_v1_5.new(rsakey)
            text = cipher.decrypt(base64.b64decode(str), random_generator)
            return text.decode()
