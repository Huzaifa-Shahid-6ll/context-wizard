"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Card } from "@/components/ui/card";
import { AlertCircle, Clock, DollarSign } from "@/lib/icons";
import ShinyText from "@/components/ui/ShinyText";
import Image from "next/image";

// Register ScrollTrigger plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const cardsData = [
  {
    id: "card1",
    icon: AlertCircle,
    iconColor: "text-destructive",
    title: "Cursor Generates Broken Code",
    description: "You paste a prompt and get code that doesn't match your project structure, uses wrong dependencies, or completely misses your architecture.",
    image: "/Robot hoping.svg",
  },
  {
    id: "card2",
    icon: Clock,
    iconColor: "text-amber-500",
    title: "Hours Wasted on Setup",
    description: "Every new project means manually writing .cursorrules, creating documentation, and explaining your codebase to AI—over and over again.",
    image: "/Robot_Girl.svg",
  },
  {
    id: "card3",
    icon: DollarSign,
    iconColor: "text-red-500",
    title: "Burning API Credits",
    description: "Bad context means more back-and-forth, more regenerations, and hundreds of wasted tokens trying to get AI to understand your project.",
    image: "/sad_boy_with_helmet.svg",
  },
];

export function ScrollLockedCards() {
  const containerRef = useRef<HTMLDivElement>(null);
  const card1Ref = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLDivElement>(null);
  const card3Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !card1Ref.current || !card2Ref.current || !card3Ref.current) {
      return;
    }

    const container = containerRef.current;
    const cards = [card1Ref.current, card2Ref.current, card3Ref.current];

    // Set initial positions - use immediate values to ensure they're set before animation
    // Card 1: visible in center
    gsap.set(cards[0], { 
      x: 0, 
      opacity: 1,
      force3D: true // Enable hardware acceleration
    });
    // Card 2: off-screen to the right and invisible
    gsap.set(cards[1], { 
      x: window.innerWidth, 
      opacity: 0,
      force3D: true
    });
    // Card 3: off-screen to the right and invisible
    gsap.set(cards[2], { 
      x: window.innerWidth, 
      opacity: 0,
      force3D: true
    });

    // Create timeline for smooth scroll-linked animations
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: "top top",
        end: "+=300%", // 3x viewport height for smooth transitions
        pin: true,
        scrub: 1.5, // Higher value = more resistance feel (smooth but with slight lag)
        anticipatePin: 1,
        pinSpacing: true,
        invalidateOnRefresh: true, // Recalculate on resize
      },
    });

    // Phase 1: Card 1 exits left and fades out, Card 2 enters from right and fades in (0% - 33% of scroll)
    tl.to(cards[0], {
      x: -window.innerWidth,
      opacity: 0,
      ease: "power2.in", // Resistance on exit
      duration: 1,
      force3D: true,
      onComplete: () => {
        cards[0].style.pointerEvents = "none";
      }
    })
      .to(
        cards[1],
        {
          x: 0,
          opacity: 1,
          ease: "power2.out", // Resistance on entry
          duration: 1,
          force3D: true,
          onStart: () => {
            cards[1].style.pointerEvents = "auto";
          }
        },
        "<" // Start simultaneously with card 1 exit
      );

    // Phase 2: Card 2 exits left and fades out, Card 3 enters from right and fades in (33% - 66% of scroll)
    tl.to(cards[1], {
      x: -window.innerWidth,
      opacity: 0,
      ease: "power2.in", // Resistance on exit
      duration: 1,
      force3D: true,
      onComplete: () => {
        cards[1].style.pointerEvents = "none";
      }
    }).to(
      cards[2],
      {
        x: 0,
        opacity: 1,
        ease: "power2.out", // Resistance on entry
        duration: 1,
        force3D: true,
        onStart: () => {
          cards[2].style.pointerEvents = "auto";
        }
      },
      "<" // Start simultaneously with card 2 exit
    );

    // Phase 3: Card 3 stays visible (66% - 100% of scroll)
    // Timeline naturally pauses here, allowing normal scroll to resume

    return () => {
      // Cleanup ScrollTrigger - kill all triggers associated with this container
      const triggers = ScrollTrigger.getAll();
      triggers.forEach((trigger) => {
        if (trigger.trigger === container || trigger.vars?.trigger === container) {
          trigger.kill();
        }
      });
      // Also kill the timeline
      tl.kill();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden"
    >
      {/* Card 1 */}
      <div
        ref={card1Ref}
        className="absolute inset-0 flex items-center justify-center px-4 md:px-8"
        style={{ pointerEvents: "auto" }}
      >
        <div className="w-full max-w-6xl">
          <Card className="light-shine depth-layer-2 shadow-depth-md border-0 hover:depth-layer-3 hover:shadow-elevated transition-all duration-300 p-8 md:p-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="text-left">
                <div className="mb-6">
                  <h3 className="card-heading-ratio text-shadow-sm">
                    <ShinyText text={cardsData[0].title} speed={3} className="card-heading-ratio" />
                  </h3>
                </div>
                <p className="text-muted-foreground text-lg md:text-xl leading-relaxed">
                  {cardsData[0].description}
                </p>
              </div>
              <div className="relative w-full h-full min-h-[400px] md:min-h-[500px] rounded-xl overflow-hidden depth-layer-1 shadow-depth-md border border-border/50 flex items-center justify-center bg-white force-bg-white">
                <div className="relative w-full h-full flex items-center justify-center p-4">
                  <Image
                    src={cardsData[0].image}
                    alt={cardsData[0].title}
                    width={500}
                    height={500}
                    className="w-full h-full object-contain"
                    priority
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Card 2 */}
      <div
        ref={card2Ref}
        className="absolute inset-0 flex items-center justify-center px-4 md:px-8"
        style={{ pointerEvents: "none" }}
      >
        <div className="w-full max-w-6xl">
          <Card className="light-shine depth-layer-2 shadow-depth-md border-0 hover:depth-layer-3 hover:shadow-elevated transition-all duration-300 p-8 md:p-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="text-left">
                <div className="mb-6">
                  <h3 className="card-heading-ratio text-shadow-sm">
                    <ShinyText text={cardsData[1].title} speed={3} className="card-heading-ratio" />
                  </h3>
                </div>
                <p className="text-muted-foreground text-lg md:text-xl leading-relaxed">
                  {cardsData[1].description}
                </p>
              </div>
              <div className="relative w-full h-full min-h-[400px] md:min-h-[500px] rounded-xl overflow-hidden depth-layer-1 shadow-depth-md border border-border/50 flex items-center justify-center bg-white force-bg-white">
                <div className="relative w-full h-full flex items-center justify-center p-4">
                  <Image
                    src={cardsData[1].image}
                    alt={cardsData[1].title}
                    width={500}
                    height={500}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Card 3 */}
      <div
        ref={card3Ref}
        className="absolute inset-0 flex items-center justify-center px-4 md:px-8"
        style={{ pointerEvents: "none" }}
      >
        <div className="w-full max-w-6xl">
          <Card className="light-shine depth-layer-2 shadow-depth-md border-0 hover:depth-layer-3 hover:shadow-elevated transition-all duration-300 p-8 md:p-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="text-left">
                <div className="mb-6">
                  <h3 className="card-heading-ratio text-shadow-sm">
                    <ShinyText text={cardsData[2].title} speed={3} className="card-heading-ratio" />
                  </h3>
                </div>
                <p className="text-muted-foreground text-lg md:text-xl leading-relaxed">
                  {cardsData[2].description}
                </p>
              </div>
              <div className="relative w-full h-full min-h-[400px] md:min-h-[500px] rounded-xl overflow-hidden depth-layer-1 shadow-depth-md border border-border/50 flex items-center justify-center bg-white force-bg-white">
                <div className="relative w-full h-full flex items-center justify-center p-4">
                  <Image
                    src={cardsData[2].image}
                    alt={cardsData[2].title}
                    width={500}
                    height={500}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

