import binascii
import ctypes
from ctypes import *

sm2dll = ctypes.cdll.LoadLibrary('SM2Lib.dll')

sm2dll.WD_SM2Init()


def SM2GenKey(str_prikey):
    bStrPriKey = str_prikey.encode(encoding='utf_8')
    bPriKey = binascii.unhexlify(bStrPriKey)
    bPubKeyX = create_string_buffer(32)
    bPubKeyY = create_string_buffer(32)
    sm2dll.WD_SM2GenKey(bPriKey, bPubKeyX, bPubKeyY)
    bStrPubKeyX = binascii.hexlify(bPubKeyX)
    StrPubKeyX = bStrPubKeyX.decode()
    bStrPubKeyY = binascii.hexlify(bPubKeyY)
    StrPubKeyY = bStrPubKeyY.decode()
    return StrPubKeyX + StrPubKeyY


def SM2Encrypt(str_random, str_pubkey, str_plain):
    Str_PubKey = str_pubkey
    str_PubKeyX = Str_PubKey[0:64]
    str_PubKeyY = Str_PubKey[64:]
    bStrPubKeyX = str_PubKeyX.encode(encoding='utf_8')
    bStrPubKeyY = str_PubKeyY.encode(encoding='utf_8')
    bPubKeyX = binascii.unhexlify(bStrPubKeyX)
    bPubKeyY = binascii.unhexlify(bStrPubKeyY)
    bStrPlain = str_plain.encode(encoding='utf_8')
    bPlain = binascii.unhexlify(bStrPlain)
    bStrRandom = str_random.encode(encoding='utf_8')
    bRandom = binascii.unhexlify(bStrRandom)
    bCipher = create_string_buffer(512)
    CipherLen = ctypes.c_uint(256)
    sm2dll.WD_SM2Encrypt(bRandom, bPubKeyX, bPubKeyY, bPlain, len(bPlain), bCipher, pointer(CipherLen))
    bStrCipher = binascii.hexlify(bCipher)
    StrResponse = bStrCipher.decode()
    return StrResponse[0:2 * CipherLen.value]


def SM2Decrypt(str_cipher, str_prikey):
    bStrPrikey = str_prikey.encode(encoding='utf_8')
    bPriKey = binascii.unhexlify(bStrPrikey)
    StrCipher = str_cipher
    bStrCipher = StrCipher.encode(encoding='utf_8')
    bCipher = binascii.unhexlify(bStrCipher)
    bPlain = create_string_buffer(512)
    PlainLen = ctypes.c_uint(256)
    sm2dll.WD_SM2Decrypt(bPriKey, bCipher, len(bCipher), bPlain, pointer(PlainLen))
    bStrPlain = binascii.hexlify(bPlain)
    StrResponse = bStrPlain.decode()
    return StrResponse[0:2 * PlainLen.value]
