# import cv2
# import numpy as np
#
# def pHash(imgfile):
#     """get image pHash value"""
#     # 加载并调整图片为32x32灰度图片
#     # img = cv2.imdecode(np.fromfile(imgfile, dtype=np.uint8), -1)
#     img = cv2.imread(imgfile, cv2.IMREAD_GRAYSCALE)
#     img = cv2.resize(img, (32, 32), interpolation=cv2.INTER_CUBIC)
#
#     # 创建二维列表
#     h, w = img.shape[:2]
#     vis0 = np.zeros((h, w), np.float32)
#     vis0[:h, :w] = img  # 填充数据
#
#     # 二维Dct变换
#     vis1 = cv2.dct(cv2.dct(vis0))
#     # cv.SaveImage('a.jpg',cv.fromarray(vis0)) #保存图片
#     vis1.resize(8, 8)
#
#     # 把二维list变成一维list
#     vis1 = vis1.flatten()
#     img_list = vis1.tolist()
#
#     # 计算均值
#     avg = sum(img_list) * 1. / len(img_list)
#     avg_list = ['0' if i < avg else '1' for i in img_list]
#
#     # 得到哈希值
#     return ''.join(['%x' % int(''.join(avg_list[x:x + 4]), 2) for x in range(0, 64, 4)])
#
#
# def hamming_distance_with_hash(phash1, phash2):
#     # print(phash1, phash2)
#     difference = (int(phash1, 16)) ^ (int(phash2, 16))
#     return bin(difference).count("1")

#! /usr/bin/env python

import math
import PIL.Image as Image


def median(data):
    data = sorted(data)
    length = len(data)
    if length % 2 == 0:
        return (data[length // 2 - 1] + data[length // 2]) / 2.0
    return data[length // 2]


def total_value_rgba(im, data, x, y):
    r, g, b, a = data[y * im.size[0] + x]
    if a == 0:
        return 765
    else:
        return r + g + b


def total_value_rgb(im, data, x, y):
    r, g, b = data[y * im.size[0] + x]
    return r + g + b


def translate_blocks_to_bits(blocks, pixels_per_block):
    half_block_value = pixels_per_block * 256 * 3 / 2

    # Compare medians across four horizontal bands
    bandsize = len(blocks) // 4
    for i in range(4):
        m = median(blocks[i * bandsize: (i + 1) * bandsize])
        for j in range(i * bandsize, (i + 1) * bandsize):
            v = blocks[j]

            # Output a 1 if the block is brighter than the median.
            # With images dominated by black or white, the median may
            # end up being 0 or the max value, and thus having a lot
            # of blocks of value equal to the median.  To avoid
            # generating hashes of all zeros or ones, in that case output
            # 0 if the median is in the lower value space, 1 otherwise
            blocks[j] = int(v > m or (abs(v - m) < 1 and m > half_block_value))


def bits_to_hexhash(bits):
    return '{0:0={width}x}'.format(int(''.join([str(x) for x in bits]), 2), width=len(bits) // 4)


def blockhash_even(im, bits):
    if im.mode == 'RGBA':
        total_value = total_value_rgba
    elif im.mode == 'RGB':
        total_value = total_value_rgb
    else:
        raise RuntimeError('Unsupported image mode: {}'.format(im.mode))

    data = im.getdata()
    width, height = im.size
    blocksize_x = width // bits
    blocksize_y = height // bits

    result = []

    for y in range(bits):
        for x in range(bits):
            value = 0

            for iy in range(blocksize_y):
                for ix in range(blocksize_x):
                    cx = x * blocksize_x + ix
                    cy = y * blocksize_y + iy
                    value += total_value(im, data, cx, cy)

            result.append(value)
    # print(blocksize_x, blocksize_y)

    translate_blocks_to_bits(result, blocksize_x * blocksize_y)
    return bits_to_hexhash(result)


def blockhash(im, bits):
    if im.mode == 'RGBA':
        total_value = total_value_rgba
    elif im.mode == 'RGB':
        total_value = total_value_rgb
    else:
        raise RuntimeError('Unsupported image mode: {}'.format(im.mode))

    data = im.getdata()
    # print(str(data))
    width, height = im.size

    even_x = width % bits == 0
    even_y = height % bits == 0

    if even_x and even_y:
        return blockhash_even(im, bits)

    blocks = [[0 for col in range(bits)] for row in range(bits)]

    block_width = float(width) / bits
    block_height = float(height) / bits

    for y in range(height):
        if even_y:
            # don't bother dividing y, if the size evenly divides by bits
            block_top = block_bottom = int(y // block_height)
            weight_top, weight_bottom = 1, 0
        else:
            y_frac, y_int = math.modf((y + 1) % block_height)

            weight_top = (1 - y_frac)
            weight_bottom = (y_frac)

            # y_int will be 0 on bottom/right borders and on block boundaries
            if y_int > 0 or (y + 1) == height:
                block_top = block_bottom = int(y // block_height)
            else:
                block_top = int(y // block_height)
                block_bottom = int(-(-y // block_height))  # int(math.ceil(float(y) / block_height))

        for x in range(width):
            value = total_value(im, data, x, y)

            if even_x:
                # don't bother dividing x, if the size evenly divides by bits
                block_left = block_right = int(x // block_width)
                weight_left, weight_right = 1, 0
            else:
                x_frac, x_int = math.modf((x + 1) % block_width)

                weight_left = (1 - x_frac)
                weight_right = (x_frac)

                # x_int will be 0 on bottom/right borders and on block boundaries
                if x_int > 0 or (x + 1) == width:
                    block_left = block_right = int(x // block_width)
                else:
                    block_left = int(x // block_width)
                    block_right = int(-(-x // block_width))  # int(math.ceil(float(x) / block_width))

            # add weighted pixel value to relevant blocks
            blocks[block_top][block_left] += value * weight_top * weight_left
            blocks[block_top][block_right] += value * weight_top * weight_right
            blocks[block_bottom][block_left] += value * weight_bottom * weight_left
            blocks[block_bottom][block_right] += value * weight_bottom * weight_right

    result = [blocks[row][col] for row in range(bits) for col in range(bits)]

    translate_blocks_to_bits(result, block_width * block_height)
    print(block_width, block_height)
    return bits_to_hexhash(result)


def pHash(pic):
    method = blockhash
    sizestr = '16*16'
    im = Image.open(pic)

    # convert indexed/grayscale images to RGB
    if im.mode == '1' or im.mode == 'L' or im.mode == 'P':
        im = im.convert('RGB')
    elif im.mode == 'LA':
        im = im.convert('RGBA')

    if sizestr:
        size = sizestr.split('*')
        size = (int(size[0]), int(size[1]))
        im = im.resize(size, Image.NEAREST)

    phash = method(im, 16)

    return phash


def hamming_distance_with_hash(dhash1, dhash2):
    difference = (int(dhash1, 16)) ^ (int(dhash2, 16))
    return bin(difference).count("1")
