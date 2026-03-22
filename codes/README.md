# Computational Codes

All computations supporting "Mass Emergence from Two-Twistor Geometry."

## Part I — Python (metric, masses, couplings)

| Code | Description |
|------|-------------|
| `01_VO_quark_computation.py` | VO+(4,2) = K4⊗K4 eigenvalues, quark mass predictions |
| `02_coupling_constants.py` | All 5 fundamental couplings from prime structure |
| `03_lepton_masses.py` | Electron, muon, tau masses from (α, N, m₀) |
| `04_cosmological_constant.py` | ρ_Λ = (4/3)m₀⁴/N⁸, the 10¹²³ resolution |
| `05_boson_masses.py` | Z, W, Higgs from cone mechanics energy budget |
| `06_cosmology.py` | Hubble, MOND, dark matter fraction, age |

## Part II — JavaScript (dark sector, derived equations)

| Code | Description |
|------|-------------|
| `compute_dark_sector.js` | Dark fermion masses, √2 scaling, dark electron = muon |
| `compute_dark_sector_v2.js` | Extended dark sector: dark photon, three generations |
| `compute_dark_bh.js` | Dark black holes, Chandrasekhar limit, TOV limit |
| `compute_maxwell.js` | Maxwell equations from torsion derivation |
| `compute_schrodinger.js` | Schrödinger from 5D wave equation |
| `compute_experiments.js` | Experimental predictions and testable signatures |

## Part III — Python (Poinsot, gravitational waves, CMB)

| Code | Description |
|------|-------------|
| `07_poinsot_evolution.py` | Poinsot ellipsoid I1/I3 = 7/6, 5/2, 13/2 at three thresholds |
| `08_braking_energetics.py` | Spin-down to pure precession, torsion = gravity |
| `09_black_hole_poinsot.py` | BH from Poinsot: horizon, dark/visible, M-sigma |
| `10_c1c2_modulation.py` | c1/c2 light speed modulation, E/B mode waveforms |
| `11_bose_einstein_modes.py` | BE symmetry breaking, mode statistics |
| `12_gw_prediction.py` | GW250114 retrodict + LIGO IR1 predictions (filed March 22, 2026) |
| `13_bose_einstein_physical.py` | BE physical parameters |
| `14_cone_ideal_evolution.py` | Ideal cone geometry evolution |
| `15_omega_state_count.py` | Omega state counting, entropy |
| `16_poinsot_3d_visual.py` | 3D Poinsot visualization data |
| `17_volume_ratio.py` | Ellipsoid/cone volume ratios |

## Requirements

- Python 3.x + NumPy (Parts I, III)
- Node.js (Part II)

## Running

```bash
# Part I
python 01_VO_quark_computation.py
python 02_coupling_constants.py
python 03_lepton_masses.py
python 04_cosmological_constant.py
python 05_boson_masses.py
python 06_cosmology.py

# Part II
node compute_dark_sector.js
node compute_dark_bh.js
node compute_maxwell.js
node compute_schrodinger.js
node compute_experiments.js

# Part III
python 07_poinsot_evolution.py
python 08_braking_energetics.py
python 09_black_hole_poinsot.py
python 10_c1c2_modulation.py
python 11_bose_einstein_modes.py
python 12_gw_prediction.py
```

All codes are self-contained and reproduce the results in the papers exactly.

---

Szőke Barna, March 2026
