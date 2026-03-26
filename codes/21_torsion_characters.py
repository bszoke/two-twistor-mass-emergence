"""
21. T Torsion Character Table
32 characters, annihilator, real vs complex, kernel sizes.
Author: Szoke Barna, March 2026
"""
from collections import Counter

BL = [(a,b,d) for a in range(4) for b in range(4) for d in range(4) if (d*d)%4==(b*b)%4]
def order(e):
    for k in range(1,33):
        if (k*e[0])%4==0 and (k*e[1])%4==0 and (k*e[2])%4==0: return k

# Annihilator
ann = [(al,be,ga) for al in range(4) for be in range(4) for ga in range(4)
       if all((al*e[0]+be*e[1]+ga*e[2])%4==0 for e in BL)]
print("Annihilator: %d elements: %s" % (len(ann), ann))

# Characters
chars = {}
seen = set()
for al in range(4):
    for be in range(4):
        for ga in range(4):
            vals = tuple((al*e[0]+be*e[1]+ga*e[2])%4 for e in BL)
            if vals not in seen:
                seen.add(vals)
                chars[(al,be,ga)] = vals

print("Distinct characters: %d" % len(chars))

# Real vs complex
real_c = [k for k,v in chars.items() if all(x in [0,2] for x in v)]
print("Real (values +/-1): %d" % len(real_c))
print("Complex (values +/-i): %d" % (len(chars)-len(real_c)))

# Kernel sizes
ksz = Counter()
for k,v in chars.items():
    kernel = sum(1 for x in v if x==0)
    ksz[kernel] += 1
print("Kernel sizes: %s" % dict(sorted(ksz.items())))
