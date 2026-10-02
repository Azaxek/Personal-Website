// One Lenis for the whole page, created at startup (not when the 3D model finishes loading) and
// driven from GSAP's ticker so ScrollTrigger and Lenis never disagree about the scroll position.
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export const lenis = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? null : new Lenis({ lerp: 0.085, smoothWheel: true })

if(lenis) {
    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add((time) => lenis.raf(time * 1000))
    gsap.ticker.lagSmoothing(0)
}
