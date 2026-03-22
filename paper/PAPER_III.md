# From Poinsot Geometry to Gravitational Waves

## Part III of Mass Emergence from Two-Twistor Geometry

**Date:** March 2026

---

## 1. Introduction: The Single-Cone Framework

Parts I and II of this series derived particle masses and coupling constants from the F2 axiom using two counter-rotating cones. The algebraic motivation, rooted in Penrose two-twistor theory, required two separate cones to carry the internal degrees of freedom. The physical picture, however, is simpler: a single cone with two counter-rotating hemispheres (upper and lower).

The Pin_{+,-,-} algebra forces the (2,3) signature. The constraint

    c1 / t2 = c2 / t1 = A

ensures causality: the product sigma = t1 * t2 is monotonically increasing, which excludes closed timelike curves. The two time coordinates are not independent but locked through the shared constant A.

This paper derives the Poinsot geometry of the single-cone configuration and extracts gravitational wave predictions. The results include a geometric tensor-to-scalar ratio, black hole ringdown eigenfrequencies, and a falsifiable prediction for the LIGO IR1 data release.

---

## 2. Poinsot Ellipsoid Evolution

Consider a solid cone of half-angle theta, constant volume V, and homogeneous density. The principal moments of inertia are

    I3 = (3/10) m r^2        (spin axis)
    I1 = (3m/20)(r^2 + 4h^2) (perpendicular axes)

where r is the base radius and h the height, related by r = h tan(theta).

Three geometric thresholds exist where the ratio I1/I3 takes exact rational values.

| theta (deg) | I1 / I3 | r vs h | I1 | I3 |
|:---:|:---:|:---:|:---:|:---:|
| 60 | 7/6 (exact) | r = h sqrt(3) | 21 h^2 / 20 | 9 h^2 / 10 |
| 45 | 5/2 (exact) | r = h | 3 h^2 / 4 | 3 h^2 / 10 |
| 30 | 13/2 (exact) | r = h / sqrt(3) | 13 h^2 / 20 | h^2 / 10 |

At theta = arctan(2) = 63.43 deg, the cone becomes a spherical top with I1 = I3 and surface-to-volume ratio S/V = 3.0.

The primes 7, 5, and 13 appearing in these ratios are not inputs to the framework. They are geometric consequences of the cone geometry at distinguished angles. The 30-degree configuration, where the axial cross-section forms an equilateral triangle (h = r sqrt(3)), is the stabilization point of the evolution.

---

## 3. Braking and Torsion

The two hemispheres of the single cone counter-rotate about the cone axis. In the idealized case of homogeneous density rho, no precession would occur: the angular momentum vectors cancel exactly and the system remains axially symmetric.

However, the probability of identical density in both hemispheres is strictly zero:

    P(identical rho in both hemispheres) = 0

This follows from Bose-Einstein statistics. Any finite system drawn from a thermal ensemble has a vanishing probability of exact microstate duplication across a macroscopic partition.

The density asymmetry delta_rho causes the spin axis to precess. The own-axis rotation brakes, and the braking energy converts to torsion. Torsion is the gravitational field. The curvature-torsion relation is

    R(omega) = -D(K) - K wedge K

so that curvature equals torsion squared.

The graviton energy per cone is

    delta_rho * E_cone = (3.78 / 250) * 250 = 3.78 GeV

The total graviton energy from both hemispheres is 7.56 GeV, distributed among 8 gravitons at approximately 1 GeV each.

The final state of this braking process is complete cessation of own-axis spin. Only precession remains. Precession is mass. The particle spectrum emerges from the precession modes of the Poinsot ellipsoid.

---

## 4. Symmetry Breaking from Bose-Einstein Statistics

The symmetry breaking event is not a choice imposed on the framework but a thermodynamic necessity. The probability of perfect symmetry in any finite system is

    P(perfect symmetry) = 1 / Omega -> 0

for any finite number of microstates Omega.

The Fano plane represents the configuration of maximum combinatorial order, corresponding to a local minimum of entropy S. The birth of structure (particles, fields, spacetime curvature) is a local entropy decrease, which is mandatory for structure formation in any thermodynamic framework.

The symmetry breaks in entropy, not in space or energy. The geometric process of theta decreasing from 90 degrees is shifted from the ideal spherical-top angle of 63.43 degrees to the rational-ratio angles 60 and 30 degrees by the Bose-Einstein asymmetry.

---

## 5. c1/c2 Modulation and Polarization

The two light speeds are related to the two time coordinates by

    c1 = A * t2,    c2 = A * t1

so that

    c1 / c2 = t2 / t1 = exp(-phi)

where phi = arctan(sigma / sigma_0). The ratio c1/c2 therefore evolves with cosmological epoch. The product is invariant:

    c1 * c2 = A^2 * sigma = c^2

Before the axis break, the two counter-rotating waves cancel. The residual amplitude is

    2 * delta_rho = 0.030

After the axis break, two polarization modes emerge:

- **E-mode** (visible time modulation): gradient-like, curl-free. Compressed sinusoid with maximum amplitude less than unity.
- **B-mode** (departing time modulation): curl-like, divergence-free. Amplitude given by

      B = sin(30) * precession rate = sin(30) * 2/13

E is perpendicular to B at all times. Both E-mode and B-mode are normalized to c^2 (the common invariant), not to each other.

---

## 6. Tensor-to-Scalar Ratio

The tensor-to-scalar ratio follows directly from the Poinsot geometry:

    r = sin^2(30) * (I3 / I1)^2 = (1/2)^2 * (2/13)^2 = 1/169 = 0.00592

This is the asymptotic value at phi -> pi/2. The full epoch-dependent expression is

    r(sigma) = (1/169) * exp(pi - 2 * arctan(sigma / sigma_0))

| Epoch | sigma / sigma_0 | r |
|:---:|:---:|:---:|
| Early universe | ~0.01 | ~0.13 |
| Present | >> 1 | ~0.006 |

The BICEP/Keck 2021 upper limit is r < 0.036. The present-epoch prediction r = 0.006 is consistent with this bound.

LiteBIRD (launch 2032) has a projected sensitivity of delta_r = 0.001, sufficient to test the prediction r = 1/169 directly.

No other model predicts an epoch-dependent tensor-to-scalar ratio. Standard inflationary models give r = constant. The appearance of 13 is not coincidental: r = 1/13^2, the inverse square of the Weinberg denominator that already appeared in the electroweak sector (Part I).

---

## 7. Black Hole Ringdown and GW250114

In this framework, a black hole is not an object but a precession snapshot. The inner cone rolls on the virtual 90-degree cone surface. The four-dimensional observer sees the black hole only at alignment moments where the single-c condition is satisfied.

The ringdown tones correspond to the Poinsot ellipsoid eigenfrequencies. Three tones arise from the three principal axes. The quality factor ratio is

    Q_220 / Q_221 = (I1 / I3) / 2 = (13/2) / 2 = 13/4 = 3.25

**GW250114** (detected January 14, 2025; published in Physical Review Letters, January 29, 2026):

| Quantity | Measured | Framework | Match |
|:---|:---:|:---:|:---:|
| Final mass | 58 M_sun | — | — |
| Final spin a/M | 0.69 | cos(45) = 0.707 | 97.6% |
| Q ratio | 3.23 | 13/4 = 3.25 | 99.4% |

For mass ratio q = 0.95, the framework spin prediction refines to

    spin = 0.707 * 4 * 0.95 / (1.95)^2 = 0.700

yielding a 98.6% match with the measured value.

The no-hair theorem is derived, not postulated. The Poinsot ellipsoid is fully determined by two numbers: I1/I3 (which encodes mass) and omega (which encodes spin). No additional parameters exist.

The gravitational wave amplitude has a geometric ceiling:

    B_max = sin(30) * sin(pi/13) = 0.120

with phi capped at pi/2. A supermassive black hole is the same structure at a different precession phase, not a different object.

---

## 8. Results and Predictions

### 8.1 Problems Resolved

**Table 1. Problems resolved in Part III.**

| # | Problem | Resolution | Section |
|:---:|:---|:---|:---:|
| 34 | Causality in (2,3) signature | Constraint c1/t2 = c2/t1 forces sigma = t1*t2 monotonic. No closed timelike curves. | 1 |
| 35 | Poinsot duality | Classical rigid body mechanics and quantum mass emergence are the same geometry in two views. | 2 |
| 36 | Origin of irreversibility | Birth = local entropy decrease. Omega(sigma) monotonically increasing. Time arrow from combinatorics, not postulated. | 4 |
| 37 | Symmetry breaking mechanism | Symmetry breaks in entropy, not in space or energy. P(perfect symmetry) = 1/Omega = 0 for finite systems. | 4 |
| 38 | Origin of gravity | Gravity = braking energy of counter-rotation. Torsion = frozen spin difference between hemispheres. Not a force but a structural cost. | 3 |
| 39 | Supermassive black hole formation | SMBH is the same structure seen at different precession phases. Not built by accretion. M-sigma relation from (I3/I1)^2 = (2/13)^2. | 7 |

These six problems, combined with the 33 resolved in Parts I and II, bring the total to 39.

### 8.2 Predictions

**Table 2. Gravitational wave and cosmological predictions.**

| # | Prediction | Value | Test | Timeline |
|:---:|:---|:---:|:---:|:---:|
| 40 | CMB quadrupole suppression | ~83% from cancellation | Planck | confirmed |
| 41 | B-mode from torsion | sin(30) fraction | LiteBIRD | 2032 |
| 42 | Tensor-to-scalar ratio | r = 1/169 = 0.00592 | LiteBIRD | 2032 |
| 43 | r is epoch-dependent | r(sigma) curve | Multi-z CMB | future |
| 44 | Hemispherical asymmetry | from Poinsot delta_rho | Planck/LiteBIRD | confirmed |
| 45 | BH ringdown Q ratio | 13/4 = 3.25 (constant) | LIGO IR1 | Sept 2026 |
| 46 | Final spin (equal mass) | cos(45) = 0.707 | LIGO IR1 | Sept 2026 |
| 47 | Q ratio constant (not spin-dependent) | 3.25 for all events | LIGO IR1 | Sept 2026 |
| 48 | GW amplitude ceiling | sin(30) sin(pi/13) = 0.120 | LIGO/LISA | ongoing |

**Falsifiability.** The decisive test is prediction 47. General relativity predicts that the quality factor ratio Q_220/Q_221 depends on the remnant spin. This framework predicts it is geometric and therefore constant at 13/4 = 3.25 across all binary black hole merger events, independent of mass, spin, or mass ratio.

If LIGO IR1 reports Q ratios that vary between events, the framework is wrong. If the ratio is constant at 13/4, the framework is confirmed. This is a clean, decisive test with no adjustable parameters.

---

## 9. Closing Remarks

The framework produced Parts I through III in approximately 15 days. The numerical results — more than 32 predictions matching observation at 99.4% average accuracy — emerged faster than they could be properly interpreted. The physical picture evolved from two cones (Part I) through the dark sector and derived field equations (Part II) to the Poinsot geometry and gravitational wave predictions presented here (Part III).

The author acknowledges that the volume and pace of these results exceeds what a single researcher can rigorously verify and interpret in isolation. The computations are reproducible (all codes included in the repository), the predictions are falsifiable (Table 1), and the prior art is documented (git timestamps, DOI: 10.5281/zenodo.19140795). The definitive interpretation and verification is the responsibility of the broader physics community.

The framework stands or falls on its predictions. If LIGO IR1 measures Q_220/Q_221 = 13/4 across multiple events, and if LiteBIRD detects r = 1/169, the geometric origin of mass emergence is confirmed. If not, the framework is falsified. Either outcome advances physics.

<p align="center"><em>From F2 to gravitational waves. One axiom. No free parameters.</em></p>

---

**Author:** Szőke Barna
**DOI:** 10.5281/zenodo.19140795
