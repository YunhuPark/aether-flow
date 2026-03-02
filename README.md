<div align="center">
  
# 🌌 Aether Flow

**Aether Flow** is an ultimate interactive real-time 3D web experience. <br/>
Wield the power of the cosmos at your fingertips using pure web technologies.

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Threejs](https://img.shields.io/badge/threejs-black?style=for-the-badge&logo=three.js&logoColor=white)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)

</div>

---

## ✨ Features
- **Real-Time Hand Tracking**: Control millions of particles without touching your mouse or keyboard, powered by Google's MediaPipe.
- **Volumetric 3D Formations**: See mathematically precise representations of natural phenomenon:
  - 🪐 **Saturn**: Dense spherical body with correctly tilted Cassini division rings.
  - 🌌 **Spiral Galaxy**: Logarithmic particle arms mimicking real astronomical depths.
  - 🧬 **DNA**: Thick, twisted volumetric double strands.
  - 💜 **Heart**: A deep glowing core suspended in space.
  - ✨ **Scatter**: Infinite sprawling stardust.
- **Dynamic Physics Engine**: Particles react individually to physical forces depending on your hand gestures.

## 🖐️ Gesture Commands
Aether Flow detects the shape of your hand to trigger vastly different physics interactions:

| Gesture | Description | Physics Effect |
| :--- | :--- | :--- |
| **🖐️ Open Hand (Scatter)** | All 5 fingers extended | Gentle continuous flow and dispersion of particles. |
| **✊ Fist (Focus)** | All fingers closed | Reverses gravity, sucking all particles into a super-dense bright core. |
| **✌️ Peace Sign (Vortex)** | Index and middle finger up | Generates a massive orbital tornado effect around the shape. |
| **☝️ Point (Repel)** | Only index finger up | Acts as a forcefield, aggressively pushing particles away from your cursor. |
| **🤏 Pinch (Select)** | Thumb and index close | Click UI buttons instantly without a mouse. |

## 🚀 How to Run Locally

Clone the repository and install dependencies sequentially:

```bash
# 1. Clone the repo
git clone https://github.com/YunhuPark/aether-flow.git

# 2. Enter directory
cd aether-flow

# 3. Install packages
npm install

# 4. Start local development server
npm run dev
```

Navigate to `http://localhost:5173/` in your browser.  
*(Make sure to **allow webcam access** when prompted for the interactions to work!)*

---

## 🛠️ Tech Stack
- **Frontend Framework**: React 19 + Vite
- **3D Graphics**: Three.js (`@react-three/fiber` / raw `three`)
- **Computer Vision**: MediaPipe Hands (`@mediapipe/hands`)
- **Styling**: Pure CSS3 with Glassmorphism and Neon glow aesthetics.

## 📄 License
This project is open-source and available under the terms of the MIT License.
