---
name: Aetheric Intelligence
colors:
  surface: '#101415'
  surface-dim: '#101415'
  surface-bright: '#363a3b'
  surface-container-lowest: '#0b0f10'
  surface-container-low: '#191c1e'
  surface-container: '#1d2022'
  surface-container-high: '#272a2c'
  surface-container-highest: '#323537'
  on-surface: '#e0e3e5'
  on-surface-variant: '#c2c6d6'
  inverse-surface: '#e0e3e5'
  inverse-on-surface: '#2d3133'
  outline: '#8c909f'
  outline-variant: '#424754'
  surface-tint: '#adc6ff'
  primary: '#adc6ff'
  on-primary: '#002e6a'
  primary-container: '#4d8eff'
  on-primary-container: '#00285d'
  inverse-primary: '#005ac2'
  secondary: '#d0bcff'
  on-secondary: '#3c0091'
  secondary-container: '#571bc1'
  on-secondary-container: '#c4abff'
  tertiary: '#c3c6d7'
  on-tertiary: '#2c303d'
  tertiary-container: '#8d90a0'
  on-tertiary-container: '#252936'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004395'
  secondary-fixed: '#e9ddff'
  secondary-fixed-dim: '#d0bcff'
  on-secondary-fixed: '#23005c'
  on-secondary-fixed-variant: '#5516be'
  tertiary-fixed: '#dfe2f3'
  tertiary-fixed-dim: '#c3c6d7'
  on-tertiary-fixed: '#171b28'
  on-tertiary-fixed-variant: '#434654'
  background: '#101415'
  on-background: '#e0e3e5'
  surface-variant: '#323537'
typography:
  display:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1440px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
---

## Brand & Style
The design system is built on the concept of "Navigating the Nebula"—a high-end, futuristic aesthetic for an AI Trip Architect. It prioritizes a "Living App" feel where the UI feels like a seamless extension of the user's intent. 

The style utilizes **Glassmorphism** as its foundational layer, creating a sense of depth and luxury through translucent surfaces and background blurs. The brand personality is intelligent and fast, evoked through a high-contrast palette and precise typography. The emotional response is one of calm confidence and sophisticated exploration.

## Colors
This design system operates exclusively in a dark mode environment to maximize the "cosmic" feel. 
- **Deep Navy (#0A0E1A):** The core background, providing a vast, stable canvas.
- **Electric Blue (#3B82F6):** Used for primary actions, navigational cues, and intelligent "active" states.
- **Vibrant Purple (#8B5CF6):** Reserved for AI-driven insights, premium features, and data highlights.
- **Glass Surfaces:** Semi-transparent white layers with a 20px - 40px background blur are used to differentiate functional areas without hard color blocks.

## Typography
The typography system uses **Inter** for its systematic, utilitarian, and clean properties, ensuring legibility against complex glass backgrounds. For technical data and labels, **Geist** is introduced to provide a developer-friendly, precise feel that aligns with the AI-driven nature of the product.

Headlines should utilize tighter letter-spacing for a modern, "compact" look. Large display text may use a subtle gradient from Electric Blue to Vibrant Purple in high-impact areas.

## Layout & Spacing
The design system follows a **fluid grid** model that emphasizes breathing room and optical balance. 

- **Desktop:** A 12-column grid with generous 48px outer margins. Glass containers should feel like they float over the navy background.
- **Mobile:** A 4-column grid with 16px margins.
- **Spacing Rhythm:** Based on an 8px linear scale. Dynamic padding (e.g., 32px, 64px) is encouraged to maintain the "luxury" feel, avoiding cluttered information density.

## Elevation & Depth
Depth is conveyed through **Backdrop Blurs** and **Ambient Glows** rather than traditional drop shadows.

1.  **Level 1 (Base):** Deep Navy background.
2.  **Level 2 (Cards/Panels):** Glass surfaces (#FFFFFF10) with a 1px border (#FFFFFF20) and a `backdrop-filter: blur(20px)`.
3.  **Level 3 (Popovers/Modals):** Glass surfaces with higher opacity and a soft outer glow in either Electric Blue or Vibrant Purple (opacity 15%, blur 30px) to indicate high-priority interaction.
4.  **Active State:** Elements being interacted with should "pulse" with a subtle inner glow.

## Shapes
The shape language is consistently **Rounded**, using a 0.5rem (8px) base radius. This balances the technical precision of the AI with the approachable, "human" nature of travel planning. Large containers and main action buttons should utilize `rounded-xl` (24px) to feel softer and more premium.

## Components

### Buttons
- **Primary:** Gradient background (Electric Blue to Purple), `rounded-xl`, with a subtle 10px outer glow of the same color. Text is white/bold.
- **Secondary (Glass):** Transparent background with a 1px white border at 30% opacity. `backdrop-filter: blur(10px)`.

### Futuristic Cards
- Cards must have a 1px semi-transparent top-border to simulate light catching the edge of glass. 
- Content within cards should use high-contrast white text for titles and 70% white for secondary body text.

### Inputs & Selection
- **Inputs:** Darker translucent fill (#00000030) with a 1px border. On focus, the border glows Electric Blue.
- **Chips:** Small, highly rounded (pill) elements used for tags like "Luxury," "Fastest," or "AI Recommended," utilizing the Purple accent.

### Data Visualization
- Lines and bars should use neon-style glow effects. 
- Use "Ghost" paths (low opacity) to show historical or projected travel data behind the current "active" itinerary line.

### Intelligence Indicators
- A "Living" AI orb or subtle animated gradient mesh should be present when the Trip Architect is "thinking" or processing data.