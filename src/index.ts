import {
  ViewerApp,
  AssetManagerPlugin,
  GBufferPlugin,
  timeout,
  ProgressivePlugin,
  TonemapPlugin,
  SSRPlugin,
  SSAOPlugin,
  DiamondPlugin,
  FrameFadePlugin,
  GLTFAnimationPlugin,
  GroundPlugin,
  BloomPlugin,
  TemporalAAPlugin,
  AnisotropyPlugin,
  GammaCorrectionPlugin,
  addBasePlugins,
  ITexture,
  TweakpaneUiPlugin,
  AssetManagerBasicPopupPlugin,
  CanvasSnipperPlugin,
  IViewerPlugin,
  FileTransferPlugin,
  FullScreenPlugin,
  AssetImporter,
  mobileAndTabletCheck,
} from "webgi";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "@studio-freight/lenis";

gsap.registerPlugin(ScrollTrigger);

import "./styles.css";

async function setupViewer() {
  // Initialize the viewer
  const viewer = new ViewerApp({
    canvas: document.getElementById("webgi-canvas") as HTMLCanvasElement,
    useRgbm: false,
  });
  
  const manager = await viewer.addPlugin(AssetManagerPlugin);
  const camera = viewer.scene.activeCamera;
  const position = camera.position;
  const target = camera.target;
  const isMobile = mobileAndTabletCheck()

  await viewer.addPlugin(GBufferPlugin);
  await viewer.addPlugin(SSAOPlugin);
  await viewer.addPlugin(BloomPlugin);
  await viewer.addPlugin(AnisotropyPlugin);
  await viewer.getOrAddPlugin(GammaCorrectionPlugin)
  await viewer.getOrAddPlugin(FullScreenPlugin)
  await addBasePlugins(viewer);
  // check the source: https://codepen.io/repalash/pen/JjLxGmy for the list of plugins added.

  //Loader
  const importer = manager.importer as AssetImporter;
  importer.addEventListener("onProgress", (e)=>{
    const progressRatio = (e.loaded);
    document.querySelector('.progress')?.setAttribute('style', `transform: scaleX(${progressRatio})`)
  })
  importer.addEventListener("onLoad", (e)=>{
    gsap.to('.loader', {
      x: "100%",
      duration:0.8,
      ease: "power4.inOut",
      delay: 1,
      onComplete: () => {
        document.body.style.overflowY = 'atuo';
      }
    })
  })

  await viewer.addPlugin(AssetManagerBasicPopupPlugin);
  await viewer.addPlugin(FileTransferPlugin);
  await viewer.addPlugin(CanvasSnipperPlugin);

  await viewer.load("./assets/head.glb");
  
  viewer.renderer.refreshPipeline()
  viewer.scene.activeCamera.setCameraOptions({controlsEnabled: false})

  if(isMobile) {
    position.set(-2.19, -3.71, 16.93)
    target.set(0.13,0.08,-0.18)
    camera.setCameraOptions({fov:25})
  }
  
  // Initialize Lenis for smooth scrolling
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    wheelMultiplier: 1,
  });

  function raf(time: any) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  lenis.on("scroll", (e: any) => {
    /* console.log(e); */
  });

  // WEBGL UPDATE
  let needsUpdate = true;

  function onUpdate() {
    needsUpdate = true;
    viewer.renderer.resetShadows();
  }

  function setupScrollAnimation() {
    const tl = gsap.timeline();

    // First section animation
    gsap.set(position, {
      x: -2.74,
      y: 0.68,
      z: 13.5
    }) 
    gsap.set(target, {
      x: -0.20,
      y: -0.06,
      z: -0.06
    })

    // Second section animation 
    tl.to(position, {
      x: -4.96,
      y: 1.60,
      z: 5.78,
      duration: 4,
      scrollTrigger: {
        trigger: ".section--2",
        start: "top bottom",
        end: "top top",
        scrub: true,
        onUpdate,
      },
    })
    .to('.section--1 > .text--wrap', {
      xPercent: '-100',
      opacity: 0,
      duration: 4,
      scrollTrigger: {
        trigger: ".section--2",
        start: "top bottom",
        end: "top top",
        scrub: true, 
        onUpdate,
      },
    })
    .to(target, {
      x: 0.17,
      y: 0.47,
      z: 0.98,
      duration: 4,
      scrollTrigger: {
        trigger: ".section--2",
        start: "top bottom",
        end: "top top",
        scrub: true,
        onUpdate,
      },
    })

    // CONTACT section animation
    .to(position, {
      x: 1.28,
      y: 0.57,
      z: 5.86,
      duration: 6,
      scrollTrigger: {
        trigger: ".section--contact",
        start: "top bottom",
        end: "top top",
        scrub: true,   
        onUpdate,
      },
    })
    .to('.section--2 > .text--wrap', {
      xPercent: '100',
      opacity: 0,
      duration: 4,
      scrollTrigger: {
        trigger: ".section--contact",
        start: "top bottom",
        end: "top top",
        scrub: true, 
        onUpdate,
      },
    })
    .to(target, {
      x: -0.64,
      y: 0.44,
      z: 0.73,
      duration: 6,
      scrollTrigger: {
        trigger: ".section--contact",
        start: "top bottom",
        end: "top top",
        scrub: true,  
        onUpdate,
      },
    });
  }

  onUpdate();
  setupScrollAnimation();

  viewer.addEventListener("preFrame", () => {
    if (needsUpdate) {
      camera.positionUpdated(false);
      camera.targetUpdated(true);
      needsUpdate = false;
    }
  });
}

setupViewer();