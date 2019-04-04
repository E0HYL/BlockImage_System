import struct

IV = "7380166f 4914b2b9 172442d7 da8a0600 a96f30bc 163138aa e38dee4d b0fb0e4e"

IV = int(IV.replace(" ", ""), 16)

a = []
for i in range(0, 8):
        a.append(0)
        a[i] = (IV >> ((7 - i) * 32)) & 0xFFFFFFFF
IV = a


def out_hex(list1):
    result = ""
    for i in list1:
        result = result + "%08x" % i
    return result


def rotate_left(a, k):
        k = k % 32
        return ((a << k) & 0xFFFFFFFF) | ((a & 0xFFFFFFFF) >> (32 - k))


T_j = []
for i in range(0, 16):
        T_j.append(0)
        T_j[i] = 0x79cc4519
for i in range(16, 64):
        T_j.append(0)
        T_j[i] = 0x7a879d8a


def FF_j(X, Y, Z, j):
        if 0 <= j and j < 16:
                ret = X ^ Y ^ Z
        elif 16 <= j and j < 64:
                ret = (X & Y) | (X & Z) | (Y & Z)
        return ret


def GG_j(X, Y, Z, j):
        if 0 <= j and j < 16:
                ret = X ^ Y ^ Z
        elif 16 <= j and j < 64:
                #ret = (X | Y) & ((2 ** 32 - 1 - X) | Z)
                ret = (X & Y) | ((~ X) & Z)
        return ret


def P_0(X):
        return X ^ (rotate_left(X, 9)) ^ (rotate_left(X, 17))


def P_1(X):
        return X ^ (rotate_left(X, 15)) ^ (rotate_left(X, 23))


def CF(V_i, B_i):
    W = []
    for j in range(0, 16):
        W.append(0)
        unpack_list = struct.unpack(">I", B_i[j * 4:(j + 1) * 4])
        W[j] = unpack_list[0]
    for j in range(16, 68):
        W.append(0)
        W[j] = P_1(W[j - 16] ^ W[j - 9] ^ (rotate_left(W[j - 3], 15))) ^ (rotate_left(W[j - 13], 7)) ^ W[j - 6]
        str1 = "%08x" % W[j]
    W_1 = []
    for j in range(0, 64):
        W_1.append(0)
        W_1[j] = W[j] ^ W[j + 4]
        str1 = "%08x" % W_1[j]

    A, B, C, D, E, F, G, H = V_i
    """  
    print "00",  
    out_hex([A, B, C, D, E, F, G, H])  
    """
    for j in range(0, 64):
        SS1 = rotate_left(((rotate_left(A, 12)) + E + (rotate_left(T_j[j], j))) & 0xFFFFFFFF, 7)
        SS2 = SS1 ^ (rotate_left(A, 12))
        TT1 = (FF_j(A, B, C, j) + D + SS2 + W_1[j]) & 0xFFFFFFFF
        TT2 = (GG_j(E, F, G, j) + H + SS1 + W[j]) & 0xFFFFFFFF
        D = C
        C = rotate_left(B, 9)
        B = A
        A = TT1
        H = G
        G = rotate_left(F, 19)
        F = E
        E = P_0(TT2)

        A = A & 0xFFFFFFFF
        B = B & 0xFFFFFFFF
        C = C & 0xFFFFFFFF
        D = D & 0xFFFFFFFF
        E = E & 0xFFFFFFFF
        F = F & 0xFFFFFFFF
        G = G & 0xFFFFFFFF
        H = H & 0xFFFFFFFF
        """  
        str1 = "%02d" % j  
        if str1[0] == "0":  
                str1 = ' ' + str1[1:]  
        print str1,  
        out_hex([A, B, C, D, E, F, G, H])  
        """

    V_i_1 = []
    V_i_1.append(A ^ V_i[0])
    V_i_1.append(B ^ V_i[1])
    V_i_1.append(C ^ V_i[2])
    V_i_1.append(D ^ V_i[3])
    V_i_1.append(E ^ V_i[4])
    V_i_1.append(F ^ V_i[5])
    V_i_1.append(G ^ V_i[6])
    V_i_1.append(H ^ V_i[7])
    return V_i_1


def hash_msg(msg):
    len1 = len(msg)
    reserve1 = len1 % 64
    msg1 = msg + struct.pack("B", 128)
    reserve1 = reserve1 + 1
    for i in range(reserve1, 56):
            msg1 = msg1 + struct.pack("B", 0)

    bit_length = (len1) * 8
    bit_length_string = struct.pack(">Q", bit_length)
    msg1 = msg1 + bit_length_string

    # print (len(msg1) )
    group_count = int(len(msg1) / 64)
    # print(group_count)

    m_1 = B = []
    for i in range(0, group_count):
            B.append(0)
            B[i] = msg1[i*64:(i+1)*64]

    V = []
    V.append(0)
    V[0] = IV
    for i in range(0, group_count):
            V.append(0)
            V[i+1] = CF(V[i], B[i])
    return out_hex(V[i+1])

#
# print("abc")
# y = hash_msg("abc")
# print(y)

"""
66c7f0f4 62eeedd9 d1f2d46b dc10e4e2 4167c487 5cf2f7a2 297da02b 8f4ba8e0
"""