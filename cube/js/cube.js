import gColors from "https://cdn.jsdelivr.net/gh/nano-grid/nano-grid@pombo_poderoso/dist/gcolors.js";
import * as THREE from "../modules/three.module.min.js";
import { OrbitControls } from "../modules/OrbitControls.js";

const rad = Math.PI / 180;

customElements.define(
  "cube-visualizer",
  class extends HTMLElement {
    #data = {
      attrs: [],
      winHeight: undefined,
      winWidth: undefined,
      camera: undefined,
      scene: undefined,
      renderer: undefined,
      colors: Object.values(gColors),
      linesGroup: undefined,
      gridHelper: undefined,
      gridToggle: false,
      guidesToggle: false,
      active: false,

      minPolarAngle: 0,
      maxPolarAngle: 120 * rad,
      minDistance: 120,
      maxDistance: 500,

      controls: undefined,
    };

    constructor() {
      super();
      this.resizeWindow = this.resizeWindow.bind(this);
    }

    connectedCallback() {
      const d = this.#data;

      d.winWidth = window.innerWidth;
      d.winHeight = window.innerHeight;

      d.camera = new THREE.PerspectiveCamera(
        70,
        d.winWidth / d.winHeight,
        0.01,
        1000
      );
      d.camera.position.z = 150;

      d.scene = new THREE.Scene();
      d.scene.rotation.x = 0.1;
      d.scene.position.y = -125;

      this.createGuides();
      this.createCubes();

      d.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      this.resizeWindow();
      this.appendChild(d.renderer.domElement);

      d.controls = new OrbitControls(d.camera, d.renderer.domElement);
      d.controls.minPolarAngle = d.minPolarAngle;
      d.controls.maxPolarAngle = d.maxPolarAngle;
      // d.controls.minDistance = d.minDistance;
      d.controls.maxDistance = d.maxDistance;

      const url = new URLSearchParams(location.search);
      if (url.has("grid")) d.scene.add(d.gridHelper);
      if (url.has("guides")) d.scene.add(d.linesGroup);

      d.renderer.setAnimationLoop((time) => {
        d.scene.rotation.y = time / 5000;
        d.renderer.render(d.scene, d.camera);
      });

      window.addEventListener("resize", this.resizeWindow);
    }

    resizeWindow() {
      const d = this.#data;
      d.winWidth = window.innerWidth;
      d.winHeight = window.innerHeight;
      d.renderer.setSize(d.winWidth, d.winHeight);
      d.camera.aspect = d.winWidth / d.winHeight;
      d.camera.updateProjectionMatrix();
    }

    createLine(color, origin, destination) {
      const material = new THREE.LineBasicMaterial({ color: `rgb(${color})` });
      const points = [
        new THREE.Vector3(...origin),
        new THREE.Vector3(...destination),
      ];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      return new THREE.Line(geometry, material);
    }

    createGuides() {
      const d = this.#data;
      const lines = [
        this.createLine("255,0,0", [-127.5, 0, -127.5], [127.5, 0, -127.5]),
        this.createLine("0,0,255", [-127.5, 0, -127.5], [-127.5, 0, 127.5]),
        this.createLine("0,255,0", [-127.5, 0, -127.5], [-127.5, 255, -127.5]),
        this.createLine("0,255,255", [-127.5, 0, -127.5], [-127.5, 255, 127.5]),
        this.createLine("255,0,255", [-127.5, 0, -127.5], [127.5, 0, 127.5]),
        this.createLine("255,255,0", [-127.5, 0, -127.5], [127.5, 255, -127.5]),
        this.createLine(
          "255,255,255",
          [-127.5, 0, -127.5],
          [127.5, 255, 127.5]
        ),
      ];

      const boxGroup = new THREE.Group();
      const grayLines = [
        [
          [127.5, 0, -127.5],
          [127.5, 255, -127.5],
        ],
        [
          [127.5, 0, -127.5],
          [127.5, 0, 127.5],
        ],
        [
          [127.5, 0, 127.5],
          [127.5, 255, 127.5],
        ],
        [
          [-127.5, 0, 127.5],
          [127.5, 0, 127.5],
        ],
        [
          [-127.5, 255, -127.5],
          [127.5, 255, -127.5],
        ],
        [
          [-127.5, 255, -127.5],
          [-127.5, 255, 127.5],
        ],
        [
          [-127.5, 0, 127.5],
          [-127.5, 255, 127.5],
        ],
        [
          [127.5, 255, -127.5],
          [127.5, 255, 127.5],
        ],
        [
          [127.5, 255, 127.5],
          [-127.5, 255, 127.5],
        ],
      ];

      grayLines.forEach(([start, end]) =>
        boxGroup.add(this.createLine("80,80,80", start, end))
      );

      d.linesGroup = new THREE.Group();
      d.linesGroup.add(...lines, boxGroup);

      d.gridHelper = new THREE.GridHelper(255, 25);
    }

    createCubes() {
      const d = this.#data;
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const maxValue = 255;
      const distance = 1;

      for (const c of d.colors) {
        const mesh = new THREE.Mesh(
          geometry,
          new THREE.MeshBasicMaterial({ color: c.hex })
        );
        mesh.position.set(
          c.red * distance - maxValue * 0.5 * distance,
          c.green * distance,
          c.blue * distance - maxValue * 0.5 * distance
        );
        mesh.name = c.spinalCase;
        d.scene.add(mesh);
      }
    }
  }
);
