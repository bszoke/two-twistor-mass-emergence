"""
22. Cayley Graphs of T with different generator sets
Spectral comparison: z+c gap = 2x (x+z gap).
Author: Szoke Barna, March 2026
"""
import numpy as np
from collections import Counter

BL = [(a,b,d) for a in range(4) for b in range(4) for d in range(4) if (d*d)%4==(b*b)%4]
def add(e1,e2): return ((e1[0]+e2[0])%4,(e1[1]+e2[1])%4,(e1[2]+e2[2])%4)
def order(e):
    for k in range(1,33):
        if (k*e[0])%4==0 and (k*e[1])%4==0 and (k*e[2])%4==0: return k

x=(1,0,0); z=(0,1,1); c=(0,1,3)
x3=add(add(add((0,0,0),x),x),x)
z3=add(add(add((0,0,0),z),z),z)
c3=add(add(add((0,0,0),c),c),c)

sets = {
    "x": [x,x3], "z": [z,z3], "c": [c,c3],
    "x+z": [x,x3,z,z3], "x+c": [x,x3,c,c3], "z+c": [z,z3,c,c3],
    "x+z+c": [x,x3,z,z3,c,c3]
}

for name, S in sorted(sets.items(), key=lambda x: len(x[1])):
    A = np.zeros((32,32),dtype=int)
    for i in range(32):
        for s in S:
            j = BL.index(add(BL[i],s))
            A[i][j] = 1
    eigs = np.round(np.linalg.eigvalsh(A.astype(float)),1)
    ec = dict(sorted(Counter(eigs).items()))
    # Components
    vis = set(); comp = 0
    for st in range(32):
        if st in vis: continue
        comp += 1; q = [st]
        while q:
            v = q.pop(0)
            if v in vis: continue
            vis.add(v)
            for j in range(32):
                if A[v][j] and j not in vis: q.append(j)
    se = sorted(set(eigs))
    gap = se[-1]-se[-2] if len(se)>1 else 0
    print("%s: deg=%d comp=%d gap=%.1f eigs=%s" % (name,len(S),comp,gap,ec))
