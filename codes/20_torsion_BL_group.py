"""
20. T = BL(R,Z2xZ2): Complete anatomy of the torsion group
51 subgroups, Fano plane from involutions.
Author: Szoke Barna, March 2026
"""
from collections import Counter
from itertools import combinations

BL = [(a,b,d) for a in range(4) for b in range(4) for d in range(4) if (d*d)%4==(b*b)%4]

def add(e1,e2): return ((e1[0]+e2[0])%4,(e1[1]+e2[1])%4,(e1[2]+e2[2])%4)
def order(e):
    for k in range(1,33):
        if (k*e[0])%4==0 and (k*e[1])%4==0 and (k*e[2])%4==0: return k

def closure(gens):
    sub = {(0,0,0)}
    for g in gens: sub.add(g)
    changed = True
    while changed:
        changed = False
        new = set()
        for a in sub:
            for b in sub:
                s = add(a,b)
                if s not in sub: new.add(s); changed=True
        sub |= new
    return frozenset(sub)

print("|T| = %d" % len(BL))
od = Counter(order(e) for e in BL)
print("Orders: %s" % dict(sorted(od.items())))

# Heavy vs light involutions
for e in sorted(BL):
    if order(e) != 2: continue
    z4s = sum(1 for x in BL if order(x)==4 and add(x,x)==e)
    typ = "HEAVY (%d Z4s)" % z4s if z4s > 0 else "LIGHT"
    print("  %s: %s" % (str(e), typ))

# Find subgroups
all_subs = {frozenset([(0,0,0)]), frozenset(BL)}
for e in BL:
    if e==(0,0,0): continue
    all_subs.add(closure([e]))
inv_list = [e for e in BL if order(e)==2]
for e1 in BL:
    for e2 in BL[BL.index(e1)+1:]:
        if e1==(0,0,0) or e2==(0,0,0): continue
        all_subs.add(closure([e1,e2]))
for combo in combinations(inv_list,3):
    all_subs.add(closure(list(combo)))

by_size = {}
for s in all_subs:
    by_size.setdefault(len(s),[]).append(s)

print("
Subgroups: %d" % len(all_subs))
for sz in sorted(by_size):
    print("  Size %d: %d" % (sz, len(by_size[sz])))

# Fano check: 7 Klein groups
z2z2 = [s for s in all_subs if len(s)==4 and all(order(e)<=2 for e in s)]
pairs_1 = sum(1 for i in range(len(z2z2)) for j in range(i+1,len(z2z2))
    if len((z2z2[i]-{(0,0,0)})&(z2z2[j]-{(0,0,0)}))==1)
print("
7 Klein groups = Fano: %d pairs share 1 point (should be 21): %s" % (pairs_1, pairs_1==21))

# Exact sequence
im_delta = set(((2*e[0])%4,(2*e[1])%4,(2*e[2])%4) for e in BL)
print("
Exact sequence: 0 -> Z2^3(8) -> T(32) -> K4(%d) -> 0" % len(im_delta))
