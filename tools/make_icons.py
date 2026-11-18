# Genera los iconos PNG (sin dependencias externas). Uso: python3 tools/make_icons.py
import zlib, struct, os
def png(size, path):
    bg=(255,107,53); fg=(255,255,255)
    s=size/180
    rects=[(30,78,120,24),(22,52,22,76),(136,52,22,76),(44,62,14,56),(122,62,14,56)]  # barra, discos
    def inside(x,y):
        for (rx,ry,rw,rh) in rects:
            if rx*s<=x<(rx+rw)*s and ry*s<=y<(ry+rh)*s: return True
        return False
    raw=b''
    for y in range(size):
        row=bytearray([0])
        for x in range(size):
            row+=bytes(fg if inside(x,y) else bg)
        raw+=bytes(row)
    def chunk(t,d): return struct.pack('>I',len(d))+t+d+struct.pack('>I',zlib.crc32(t+d)&0xffffffff)
    data=b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('>IIBBBBB',size,size,8,2,0,0,0))+chunk(b'IDAT',zlib.compress(raw,9))+chunk(b'IEND',b'')
    open(path,'wb').write(data)
d=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','icons')
for n in (180,192,512): png(n, os.path.join(d,f'icon-{n}.png'))
