import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Importa FormsModule
import { CommonModule } from '@angular/common';
import { UserDataService } from '../../services/user-data.service';
import { Pallette } from '../../models/Color';
import { Store } from '@ngrx/store';
import { selectToken } from '../../store/auth.reducer';
import {jwtDecode} from 'jwt-decode';
import { ThemeService } from '../../services/theme-service.service';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-personalizacion-form',
  templateUrl: './personalizacion-form.component.html',
  styleUrls: ['./personalizacion-form.component.css'],
  imports: [
    FormsModule, // Agrega FormsModule aquí
    CommonModule,
    RouterLink // Agrega CommonModule aquí
  ],
})
export class PersonalizacionFormComponent implements OnInit {

  user: { id: number} | null = null;
  isEditing = false;
  editingPaletteId: number | null = null;
  palettes: Pallette[] = []
  private store = inject(Store)
  token$ = this.store.select(selectToken);
  // Valores iniciales
  name: string = 'Mi paleta'
  primaryColor: string = '#f86779';
  secondaryColor: string = '#ffffff';
  accentColor: string = '#000000';
  additionalColor1: string = '#f86779';
  additionalColor2: string = '#f86779';

  sizeTitle: string = "16";
  sizeSubtitle: string = "24";
  sizeText: string = "20";

  mainFont: File | null = null;
  secondaryFont: File | null = null;

  constructor(private userService: UserDataService, private themeService:ThemeService){}

  applyPalette(palette: Pallette) {
    this.themeService.applyTheme({
      primaryColor: palette.colors.primary,
      secondaryColor: palette.colors.secondary,
      accentColor: palette.colors.accent,
      additionalColor1: palette.colors.additional1,
      additionalColor2: palette.colors.additional2,
      sizeTitle: palette.sizes.sizeTitle,
      sizeSubtitle: palette.sizes.sizeSubtitle,
      sizeText: palette.sizes.sizeText,
      mainFont: palette.typo1,
      secondaryFont: palette.typo2
    });
  }

  createPalletteObject(): Pallette {
    return {
      name: this.name, // Puedes permitir al usuario ingresar un nombre
      colors: {
        primary: this.primaryColor,
        secondary: this.secondaryColor,
        accent: this.accentColor,
        additional1: this.additionalColor1,
        additional2: this.additionalColor2
      },
      sizes:{
        sizeTitle: this.sizeTitle,
        sizeSubtitle:this.sizeSubtitle,
        sizeText: this.sizeText
      },
      typo1: this.mainFont ? this.mainFont.name : 'Arial',
      typo2: this.secondaryFont ? this.secondaryFont.name : 'Arial',
      typo1File: this.mainFont ,
      typo2File: this.secondaryFont
    };
  }

  isValidForm(): boolean {
    return (
      this.name.trim() !== '' &&
      this.primaryColor !== '' &&
      this.secondaryColor !== '' &&
      this.accentColor !== '' &&
      this.additionalColor1 !== '' &&
      this.additionalColor2 !== '' &&
      this.sizeTitle !== '' &&
      this.sizeSubtitle !== '' &&
      this.sizeText !== ''
    );
  }

  submitPallette() {
    if (!this.isValidForm()) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }
    const pallette = this.createPalletteObject();
    const formData = new FormData();
    console.log(pallette)

    // Agregar los datos al FormData
    formData.append('name', pallette.name);
    formData.append('colors', JSON.stringify(pallette.colors));
    formData.append('sizes', JSON.stringify(pallette.sizes))
    formData.append('typo1', pallette.typo1);
    formData.append('typo2', pallette.typo2);
    formData.append('userId', this.user?.id ? this.user.id.toString() : '0');
    if (pallette.typo1File) {
      formData.append('typo1File', pallette.typo1File);
    }
    if (pallette.typo2File) {
      formData.append('typo2File', pallette.typo2File);
    }

    this.userService.createPallette(formData).subscribe({
      next: (response) => {
        console.log(response)
        this.palettes.push(pallette);
      },
      error: (error) => {
        console.log(error)
      },
    })
  }


  // Método para actualizar la vista previa
  updatePreview() {
    // Aquí puedes agregar lógica adicional si es necesario
    console.log('Vista previa actualizada');
  }

  // Método para manejar la carga de tipografías
  onMainFontChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.mainFont = input.files[0];
      this.loadFont(this.mainFont, 'MainFont');
    }
  }

  onSecondaryFontChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.secondaryFont = input.files[0];
      this.loadFont(this.secondaryFont, 'SecondaryFont');
    }
  }
  editPallette(palletteId: number) {
    // Encontrar la paleta en el array local
    const paletteToEdit = this.palettes.find(p => p.id === palletteId);
    
    if (!paletteToEdit) {
        console.error('Paleta no encontrada');
        return;
    }

    // Activar modo edición
    this.isEditing = true;
    this.editingPaletteId = palletteId;

    // Actualizar los valores del formulario con los datos de la paleta
    this.name = paletteToEdit.name;
    this.primaryColor = paletteToEdit.colors.primary;
    this.secondaryColor = paletteToEdit.colors.secondary;
    this.accentColor = paletteToEdit.colors.accent;
    this.additionalColor1 = paletteToEdit.colors.additional1;
    this.additionalColor2 = paletteToEdit.colors.additional2;
    this.sizeTitle = paletteToEdit.sizes.sizeTitle;
    this.sizeSubtitle = paletteToEdit.sizes.sizeSubtitle;
    this.sizeText = paletteToEdit.sizes.sizeText;
    
    // Actualizar la vista previa
    this.updatePreview();
}

// Agregar estos nuevos métodos
confirmEdit() {

    const updatedPalette = this.createPalletteObject();
    const formData = new FormData();
    
    // Agregar los datos al FormData
    formData.append('name', updatedPalette.name);
    formData.append('colors', JSON.stringify(updatedPalette.colors));
    formData.append('sizes', JSON.stringify(updatedPalette.sizes));
    formData.append('typo1', updatedPalette.typo1);
    formData.append('typo2', updatedPalette.typo2);
    formData.append('userId', this.user?.id ? this.user.id.toString() : '0');
    
    if (updatedPalette.typo1File) {
        formData.append('typo1File', updatedPalette.typo1File);
    }
    if (updatedPalette.typo2File) {
        formData.append('typo2File', updatedPalette.typo2File);
    }

    this.userService.updatePallette(formData, this.editingPaletteId).subscribe({
        next: (response) => {
            // Actualizar la paleta en el array local
            const index = this.palettes.findIndex(p => p.id === this.editingPaletteId);
            if (index !== -1) {
                this.palettes[index] = updatedPalette;
            }
            console.log(response)
            
            // Desactivar modo edición
            this.cancelEdit();
        },
        error: (error) => {
            console.error('Error al actualizar la paleta:', error);
        }
    });
}

cancelEdit() {
    // Desactivar modo edición
    this.isEditing = false;
    this.editingPaletteId = null;
    
    // Restaurar valores iniciales
    this.name = 'Mi paleta';
    this.primaryColor = '#f86779';
    this.secondaryColor = '#ffffff';
    this.accentColor = '#000000';
    this.additionalColor1 = '#f86779';
    this.additionalColor2 = '#f86779';
    this.sizeTitle = "16";
    this.sizeSubtitle = "24";
    this.sizeText = "20";
    this.mainFont = null;
    this.secondaryFont = null;
    
    // Actualizar la vista previa
    this.updatePreview();
}

  deletePallette(palletteId: number) {
    this.userService.deletePallette(palletteId).subscribe({
      next: (response) => {
        console.log(response)
        this.palettes = this.palettes.filter(palette => palette.id !== palletteId);
      },
      error: (error) => {
        console.log(error)
      },

    })
  }

  // Método para cargar una tipografía
  loadFont(file: File, fontName: string) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const fontUrl = e.target?.result as string;
      const fontFace = new FontFace(fontName, `url(${fontUrl})`);
      fontFace.load().then((loadedFont) => {
        document.fonts.add(loadedFont);
        this.updatePreview();
      });
    };
    reader.readAsDataURL(file);
  }

  ngOnInit(){
    this.token$.subscribe((token) => {
      if (token){
      const decodedToken = jwtDecode(token) as { id: number;};
        this.user = decodedToken;
      console.log('Token en el store:', token, this.user.id);}
      else{
        this.user = null;
    console.log('No hay token en el store');
      }
    })

    this.userService.getPallettes(this.user?.id).subscribe({
      next: (response) => {
        console.log(response)
        this.palettes = response.pallette.map((pallette:any) => ({
          ...pallette,
          colors: JSON.parse(pallette.colors),
          sizes: JSON.parse(pallette.sizes),
        }));
        console.log(this.palettes);
      },
      error: (error) => {
        console.log(error)
      },

    })
  }
}