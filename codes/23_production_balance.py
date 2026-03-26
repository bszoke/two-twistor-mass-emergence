"""
23. Production Balance: energy distribution from algebra
(1,0):25% (0,1):25% (1,1):50% -> Higgs = 125 GeV
Author: Szoke Barna, March 2026
"""
print("PRODUCTION BALANCE")
print("="*60)

V = [(0,0),(1,0),(0,1),(1,1)]

def eps(a,b): return (a[0]*b[0]+a[1]*b[1])%2
def omega(a,b): return (a[0]*b[1]+a[1]*b[0])%2

# All 16 pairs
print("\nAll 16 input pairs -> (eps,omega) output:")
output_count = {}
for a in V:
    for b in V:
        out = (eps(a,b), omega(a,b))
        output_count[out] = output_count.get(out, 0) + 1
        print("  %s x %s -> %s" % (a, b, out))

print("\nOutput distribution:")
for k in sorted(output_count):
    pct = output_count[k]/16*100
    print("  %s: %d times (%.1f%%)" % (k, output_count[k], pct))

# Non-zero inputs only
print("\nNon-zero inputs (9 pairs):")
nz_count = {}
for a in V[1:]:
    for b in V[1:]:
        out = (eps(a,b), omega(a,b))
        nz_count[out] = nz_count.get(out, 0) + 1

nz_total = sum(v for k,v in nz_count.items() if k != (0,0))
for k in sorted(nz_count):
    if k == (0,0): continue
    pct = nz_count[k]/nz_total*100
    print("  %s: %d (%.1f%%)" % (k, nz_count[k], pct))

print("\nSelf-annihilation: (1,1)x(1,1) -> (%d,%d) = P^2=0" % (eps((1,1),(1,1)), omega((1,1),(1,1))))

print("\nENERGY INTERPRETATION:")
print("  E_cone = 250 GeV")
print("  (1,0) = t1: 250 x 1/4 = 62.5 GeV")
print("  (0,1) = t2: 250 x 1/4 = 62.5 GeV")
print("  (1,1) = P:  250 x 1/2 = 125.0 GeV = HIGGS MASS")
print("  Observed Higgs: 125.1 GeV")
print("  Match: 99.9%")
print("  ZERO parameters.")
