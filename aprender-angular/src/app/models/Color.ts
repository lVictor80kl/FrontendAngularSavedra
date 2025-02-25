export interface Pallette {
    id?: number;
    name: string;
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      additional1: string;
      additional2: string;
    };
    sizes: {
        sizeTitle: string,
        sizeSubtitle:string,
        sizeText: string
    }
    typo1: string;
    typo2: string;
    typo1File?: File | null | string; // Permitir null
    typo2File?: File | null | string; // Permitir null
  }