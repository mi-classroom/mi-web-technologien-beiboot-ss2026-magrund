export interface PresentationState {
  currentSlideSrc: string;
  currentIndex: number;
  totalSlides: number;
}

export interface PresentationController {
  next: () => void;
  previous: () => void;
}

export async function loadSlides(): Promise<string[]> {
  try {
    const response = await fetch("/slides/slides.json", { cache: "no-store" });

    if (!response.ok) {
      return [];
    }

    const fileNames = (await response.json()) as string[];

    return fileNames.map((fileName) => `/slides/${fileName}`);
  } catch {
    return [];
  }
}

export function createPresentation(
  slides: string[],
  onChange: (state: PresentationState) => void,
): PresentationController {
  let currentIndex = 0;

  function getState(): PresentationState {
    return {
      currentSlideSrc: slides[currentIndex] ?? "",
      currentIndex,
      totalSlides: slides.length,
    };
  }

  function emit(): void {
    if (slides.length > 0) {
      onChange(getState());
    }
  }

  function next(): void {
    currentIndex = Math.min(slides.length - 1, currentIndex + 1);
    emit();
  }

  function previous(): void {
    currentIndex = Math.max(0, currentIndex - 1);
    emit();
  }

  emit();

  return {
    next,
    previous,
  };
}
