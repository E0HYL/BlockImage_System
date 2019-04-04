# import os
# from script import sm3
#
#
# def md5sumfile(filename):
#     """
#         用于获取文件的md5值
#         :param filename: 文件名
#         :return: MD5码
#         """
#     if not os.path.isfile(filename):  # 如果校验md5的文件不是文件，返回空
#         return
#     f = open(filename, 'rb')
#     while True:
#         b = f.read()
#         if not b:
#             break
#         print(len(b))
#         myhash = sm3.hash_msg(b)
#     f.close()
#     return myhash
#
#
# def md5sum(str):
#     myhash = sm3.hash_msg(str)
#     return myhash
import hashlib
import os


def md5sumfile(filename):
    """
        用于获取文件的md5值
        :param filename: 文件名
        :return: MD5码
        """
    if not os.path.isfile(filename):  # 如果校验md5的文件不是文件，返回空
        return
    myhash = hashlib.md5()
    f = open(filename, 'rb')
    while True:
        b = f.read(8096)
        if not b:
            break
        myhash.update(b)
    f.close()
    return myhash.hexdigest()

def md5sum(str):
    myhash = hashlib.md5()
    myhash.update(str)
    return myhash.hexdigest()