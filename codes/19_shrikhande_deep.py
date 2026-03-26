"""
19. Shrikhande Deep: cliques, Ihara, Reidemeister, Hamilton
Author: Szoke Barna, March 2026
"""
import numpy as np
import cmath
from itertools import combinations
from collections import Counter

eo_pairs = [[0,1],[0,3],[0,5],[0,7],[1,2],[1,4],[1,6],[2,3],[2,5],[2,7],[3,4],[3,6],[4,5],[4,7],[5,6],[6,7]]
A = np.zeros((16,16),dtype=int)
for i in range(16):
    for j in range(i+1,16):
        if len(set(eo_pairs[i])&set(eo_pairs[j]))==1: A[i][j]=A[j][i]=1

# 8 cliques
cliques = []
for elem in range(8):
    cliques.append(set(i for i,v in enumerate(eo_pairs) if elem in v))

print("8 CLIQUES (gravitons):")
for i,c in enumerate(cliques):
    print("  g%d: %s" % (i, [eo_pairs[j] for j in c]))

# Intersection matrix
print("
Clique intersection matrix:")
for i in range(8):
    row = [len(cliques[i]&cliques[j]) for j in range(8)]
    print("  g%d: %s" % (i, row))

# Spanning trees via Kirchhoff
D = np.diag(A.sum(axis=1))
L = D - A
L_red = L[1:,1:]
st = int(round(np.linalg.det(L_red.astype(float))))
print("
Spanning trees: %d" % st)
print("= 2^35:", st == 2**35)

# Reidemeister torsion L(4,1)
zeta = cmath.exp(2j*cmath.pi/4)
tau = 1
for j in range(1,4):
    tau *= abs(1 - zeta**j)
print("
Reidemeister tau(L(4,1)) = %.1f" % tau)
print("ST / tau^16 = 2^35 / 4^16 = 2^35/2^32 = %d = gravitons" % (2**35 // 4**16))

# Ihara poles
print("
Ihara poles: |u| = 1/sqrt(5) = %.6f = cos(63.43)" % (1/5**0.5))

# Cayley eigenvalues
S = [(0,1),(1,0),(1,1),(0,3),(3,0),(3,3)]
eig_cayley = {}
for a in range(4):
    for b in range(4):
        lam = sum(1j**(a*s[0]+b*s[1]) for s in S)
        if abs(lam.imag) < 0.01:
            eig_cayley[round(lam.real,1)] = eig_cayley.get(round(lam.real,1),0)+1
print("
Cayley eigenvalues:", dict(sorted(eig_cayley.items())))
