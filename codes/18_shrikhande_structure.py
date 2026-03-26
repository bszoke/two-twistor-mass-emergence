"""
18. Shrikhande Structure: T(8) = 6+16+6 decomposition
The graviton wall, transfer matrix, eigenvalues.
Author: Szoke Barna, March 2026
"""
import numpy as np
from itertools import combinations
from collections import Counter

verts = list(combinations(range(8), 2))
n = 28
adj = np.zeros((n,n), dtype=int)
for i in range(n):
    for j in range(i+1,n):
        if len(set(verts[i]) & set(verts[j])) == 1:
            adj[i][j] = adj[j][i] = 1

ee = [i for i,v in enumerate(verts) if v[0]%2==0 and v[1]%2==0]
oo = [i for i,v in enumerate(verts) if v[0]%2==1 and v[1]%2==1]
eo = [i for i,v in enumerate(verts) if (v[0]+v[1])%2==1]

print("T(8) = 28: EE=%d OO=%d EO=%d" % (len(ee),len(oo),len(eo)))

# Transfer matrix
T_full = np.zeros((6,6), dtype=int)
for i,ei in enumerate(ee):
    for j,oj in enumerate(oo):
        T_full[i][j] = sum(adj[ei][e]*adj[e][oj] for e in eo)
print("Transfer EE->EO->OO:")
print(T_full)
print("All 4s:", np.all(T_full==4))
print("Rank:", np.linalg.matrix_rank(T_full))

# EE-OO edges
ee_oo = sum(adj[i][j] for i in ee for j in oo)
print("EE-OO edges: %d (should be 0)" % ee_oo)

# EO subgraph
sub = adj[np.ix_(eo,eo)]
eigs = np.round(np.linalg.eigvalsh(sub.astype(float)),1)
print("EO eigenvalues:", dict(Counter(eigs)))

# Complement
comp = 1 - sub - np.eye(16,dtype=int)
comp_eigs = np.round(np.linalg.eigvalsh(comp.astype(float)),1)
print("Complement eigenvalues:", dict(Counter(comp_eigs)))
print("Complement = VO+(4,2) srg(16,9,4,6):", int(comp.sum(axis=1)[0])==9)
