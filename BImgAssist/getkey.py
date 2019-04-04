from random import Random


def random_str(randomlength):
    str = ''
    chars = 'abcdef0123456789'
    length = len(chars) - 1
    random = Random()
    for i in range(randomlength):
        str += chars[random.randint(0, length)]
    return str

def varserification():
    str = ''
    chars = 'qwertyuiopasdfghjklzxcvbnm1234567890'
    length = len(chars) - 1
    random = Random()
    varserificationlength = 6
    for i in range(varserificationlength):
        str += chars[random.randint(0, length)]
    return str
#
# if __name__ == '__main__':
#     print(random_str(6))
