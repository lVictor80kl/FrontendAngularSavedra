import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserDataService } from '../../services/user-data.service';
import * as L from 'leaflet';
import 'leaflet-control-geocoder';
import {CV} from '../../models/CV'
import { Store } from '@ngrx/store';
import { selectToken } from '../../store/auth.reducer';
import {jwtDecode} from 'jwt-decode';
import { RouterLink } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';


declare module 'leaflet' {
  namespace Control {
    class Geocoder extends L.Control {
      on(type: string, fn: (e: any) => void): this; // Added the on method

      constructor(options?: any);
    }
    namespace Geocoder {
      class Nominatim {
        constructor(options?: any);
      }
    }
  }
}



@Component({
  selector: 'app-formulario',
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.css'],
  imports: [CommonModule, SidebarComponent],
  standalone:true,
})

export class FormularioComponent implements OnInit {
  user: { id: number} | null = null;
  private store = inject(Store)
  token$ = this.store.select(selectToken);
  imageBase64: string = '';
  nextSkillId: number = 1;
  showLanguageSelection = false;
  selectedLanguages: string[] = [];

  toggleLanguageSelection(): void {
    this.showLanguageSelection = !this.showLanguageSelection;
  }



  buildCV(): void {
    const nombre = (document.getElementById('nombre') as HTMLInputElement).value;
    const apellido = (document.getElementById('apellido') as HTMLInputElement).value;
    const cedula = (document.getElementById('cedula') as HTMLInputElement).value;
    const profesion = (document.getElementById('profesion') as HTMLInputElement).value;
    const telefono = (document.getElementById('telefono') as HTMLInputElement).value;
    const correo = (document.getElementById('correo') as HTMLInputElement).value;
    const sitioWeb = (document.getElementById('sitioWeb') as HTMLInputElement).value;
    const ubicacion = (document.getElementById('ubicacion') as HTMLInputElement).value;
    const descripcion = (document.getElementById('descripcion') as HTMLTextAreaElement).value;

    const ubicacionSplit = ubicacion.split(',')


    const laboralExperiences = Array.from(document.querySelectorAll('#experienciaContainer .dynamic-field-container')).map(exp => ({
      titulo: (exp.querySelector('input[placeholder="Título del puesto"]') as HTMLInputElement).value,
      empresa: (exp.querySelector('input[placeholder="Empresa"]') as HTMLInputElement).value,
      fechaInicio: (exp.querySelector('input[type="month"]:first-of-type') as HTMLInputElement).value,
      fechaFin: (exp.querySelector('input[type="month"]:last-of-type') as HTMLInputElement).value,
      descripcion: (exp.querySelector('textarea') as HTMLTextAreaElement).value,
    }));

    const academyFormations = Array.from(document.querySelectorAll('#formacionContainer .dynamic-field-container')).map(form => ({
      titulo: (form.querySelector('input[placeholder="Título/Grado"]') as HTMLInputElement).value,
      institucion: (form.querySelector('input[placeholder="Institución"]') as HTMLInputElement).value,
      fechaInicio: (form.querySelector('input[type="month"]:first-of-type') as HTMLInputElement).value,
      fechaFin: (form.querySelector('input[type="month"]:last-of-type') as HTMLInputElement).value,
    }));

    const competencias = Array.from(document.querySelectorAll('#competenciasContainer .dynamic-field-container')).map(comp => ({
      nombre: (comp.querySelector('input[placeholder="Competencia"]') as HTMLInputElement).value,
      nivel: (comp.querySelector('input[type="range"]') as HTMLInputElement).value,
    }));

    const habilidades = Array.from(document.querySelectorAll('#habilidadesContainer .dynamic-field-container')).map(habil => ({
      nombre: (habil.querySelector('input[placeholder="Habilidad"]') as HTMLInputElement).value,
      nivel: Array.from(habil.querySelectorAll('.skill-point-selected')).length,
    }));

    const cv:CV = {
      id: Date.now(),
      name: nombre,
      lastname: apellido,
      CI: cedula,
      website: sitioWeb,
      profesion: profesion,
      profileDescription: descripcion,
      phone: telefono,
      email: correo,
      country: ubicacionSplit[2], 
      city: ubicacionSplit[0], 
      state: ubicacionSplit[1],
      laboralExperiences,
      languages: this.selectedLanguages,
      academyFormations,
      skills: competencias,
      softSkills: habilidades,
      userId: this.user?.id ?? 0,
    }

    console.log(cv);

    this.userService.postForm(cv).subscribe({
      next: (response) => {
        // Si el login es exitoso, redirigimos al usuario a la ruta '/form'
        console.log(response)
      },
      error: (error) => {
        // Si hay un error, activamos la bandera de error
        console.log(error)
      },
    });
  }

  previewImage(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const img = document.getElementById('preview') as HTMLImageElement;
        img.src = e.target.result;
        img.style.display = 'block';
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  saveSelectedLanguages(): void {
    const checkboxes = Array.from(
      document.querySelectorAll('#idiomasContainer input[type="checkbox"]')
    ) as HTMLInputElement[];
    
    this.selectedLanguages = checkboxes
      .filter(checkbox => checkbox.checked)
      .map(checkbox => checkbox.value);
    
    this.showLanguageSelection = false;
  }

  removeLanguage(lang: string): void {
    this.selectedLanguages = this.selectedLanguages.filter(l => l !== lang);
  }

  printCV(): void {
    // Crear contenedor de impresión
    const printContainer = document.createElement("div")
    printContainer.style.position = "fixed"
    printContainer.style.top = "0"
    printContainer.style.left = "0"
    printContainer.style.width = "100%"
    printContainer.style.height = "100%"
    printContainer.style.backgroundColor = "#FFFFFF"
    printContainer.style.zIndex = "10000"
    printContainer.style.padding = "0"
    
    // Agregar estilos para controlar la impresión
    const styleSheet = document.createElement("style")
    styleSheet.textContent = `
      @media print {
        html, body {
          height: 100vh !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        body > *:not(#print-cv) {
          display: none !important;
        }
        #print-cv {
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          width: 100% !important;
          height: 100% !important;
        }
      }
    `
    document.head.appendChild(styleSheet)
    
    // Asignar ID al contenedor
    printContainer.id = "print-cv"
    
    // Crear función para formatear fechas
    const formatDate = (startDate: string, endDate: string) => {
      const [startYear, startMonth] = startDate.split("-")
      const [endYear, endMonth] = endDate.split("-")
      const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
    
      if (startYear === endYear) {
        return `${monthNames[Number.parseInt(startMonth) - 1]} ${startYear} - ${monthNames[Number.parseInt(endMonth) - 1]} ${endYear}`
      }
      return `${startYear} - ${endYear}`
    }
    
    // Obtener la imagen del preview si existe
    const previewImg = document.getElementById("preview") as HTMLImageElement
    const imgSrc = previewImg?.src || ""
    
    // Actualizar los estilos y el HTML
    printContainer.innerHTML = `
              <style>
                @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');
                
                body { 
                  font-family: 'Roboto', sans-serif;
                  margin: 0;
                  line-height: 1.4;
                  background-color: #FFFFFF;
                  color: #333333;
                  font-size: 12px;
                }
                .header {
                  display: flex;
                  background-color: #2A2A2A;
                  padding: 30px 40px;
                  gap: 40px;
                  margin-bottom: 0;
                }
                .left-side {
                  width: 160px;
                  flex-shrink: 0;
                }
                .header img {
                  width: 160px;
                  height: 160px;
                  object-fit: cover;
                  border-radius: 4px;
                }
                .right-side {
                  flex: 1;
                  display: flex;
                  flex-direction: column;
                }
                .name-title-container {
                  margin-bottom: 15px;
                }
                .name {
                  font-size: 36px;
                  font-weight: 300;
                  margin: 0;
                  color: white;
                }
                .surname {
                  font-size: 48px;
                  font-weight: 700;
                  margin: 0;
                  color: white;
                  line-height: 1;
                }
                .job-title {
                  font-size: 20px;
                  color: #FF0000;
                  margin: 8px 0 0 0;
                }
                .bottom-content {
                  display: flex;
                  margin-top: auto;
                  gap: 40px;
                }
                .description {
                  width: 400px;
                  color: #ffffff;
                  font-size: 12px;
                  line-height: 1.4;
                  flex: 1;
                  margin-top: 20px;
                  margin-left: -200px;
                }
                .contact-info {
                  width: 240px;
                  flex-shrink: 0;
                  display: flex;
                  flex-direction: column;
                  gap: 6px;
                  align-self: flex-end;
                }
                .contact-item {
                  display: grid;
                  grid-template-columns: 20px 1fr;
                  align-items: center;
                  gap: 8px;
                  color: white;
                  font-size: 12px;
                }
                .contact-item i {
                  color: #FF0000;
                  font-size: 16px;
                  justify-self: center;
                }
                .main-content {
                  display: grid;
                  grid-template-columns: 60% 40%;
                  gap: 0;
                  background-color: #FFFFFF;
                }
                .left-column, .right-column {
                  padding: 20px;
                }
                .section {
                  margin-bottom: 20px;
                }
                .section-header {
                  background-color: #2A2A2A;
                  color: white;
                  padding: 5px 10px;
                  text-align: center;
                  margin-bottom: 10px;
                  font-weight: 500;
                  font-size: 16px;
                }
                .experience-item, .education-item {
                  margin-bottom: 15px;
                  position: relative;
                  padding-left: 20px;
                }
                .experience-item::before, .education-item::before {
                  content: "✓";
                  position: absolute;
                  left: 0;
                  color: #FF0000;
                }
                .experience-header, .education-header {
                  display: flex;
                  justify-content: space-between;
                  margin-bottom: 2px;
                }
                .experience-date, .education-date {
                  color: #666666;
                }
                .experience-description {
                  color: #666666;
                  font-size: 11px;
                  margin-top: 3px;
                }
                .language-item {
                  display: flex;
                  align-items: center;
                  gap: 12px;
                  margin-bottom: 5px;
                  margin-left: 80px;
                  font-size: 14px;
                }
                .language-check {
                  width: 16px;
                  height: 16px;
                  background-color: #FF0000;
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: white;
                  font-size: 12px;
                  line-height: 1;
                }
                .competency-item {
                  display: flex;
                  align-items: center;
                  gap: 10px;
                  margin-bottom: 8px;
                }
                .competency-name {
                  flex: 0 0 auto;
                  min-width: 100px;
                }
                .competency-bar {
                  flex: 1;
                  height: 7px;
                  background-color: #EEEEEE;
                  border-radius: 6px;
                }
                .competency-level {
                  height: 100%;
                  background-color: #FF0000;
                  border-radius: 6px;
                }
                .skill-item {
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                  margin-bottom: 5px;
                }
                .skill-dots {
                  display: flex;
                  gap: 3px;
                }
                .skill-dot {
                  width: 10px;
                  height: 10px;
                  border-radius: 50%;
                  background-color: #FF0000;
                }
                .skill-dot.empty {
                  background-color: #DDDDDD;
                }
                @media print {
                  body {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                  }
                  .header, .section-header {
                    background-color: #2A2A2A !important;
                  }
                  .competency-level, .skill-dot, .language-check {
                    background-color: #FF0000 !important;
                  }
                  .skill-dot.empty {
                    background-color: #DDDDDD !important;
                  }
                }
              </style>
              <div class="header">
                <div class="left-side">
                  ${imgSrc ? `<img src="${imgSrc}" alt="Foto de perfil">` : ""}
                </div>
                <div class="right-side">
                  <div class="name-title-container">
                    <div class="name">${(document.getElementById("nombre") as HTMLInputElement)?.value}</div>
                    <div class="surname">${(document.getElementById("apellido") as HTMLInputElement)?.value}</div>
                    <div class="job-title">${(document.getElementById("profesion") as HTMLInputElement)?.value}</div>
                  </div>
                  
                  <div class="bottom-content">
                    <div class="description">
                      ${(document.getElementById("descripcion") as HTMLTextAreaElement)?.value}
                    </div>
                    <div class="contact-info">
                      <div class="contact-item">
                        <i class="material-icons">phone</i>
                        <span>${(document.getElementById("telefono") as HTMLInputElement)?.value}</span>
                      </div>
                      <div class="contact-item">
                        <i class="material-icons">email</i>
                        <span>${(document.getElementById("correo") as HTMLInputElement)?.value}</span>
                      </div>
                      <div class="contact-item">
                        <i class="material-icons">language</i>
                        <span>${(document.getElementById("sitioWeb") as HTMLInputElement)?.value || "No especificado"}</span>
                      </div>
                      <div class="contact-item">
                        <i class="material-icons">location_on</i>
                        <span>${(document.getElementById("ubicacion") as HTMLInputElement)?.value}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
    
              <div class="main-content">
                <div class="left-column">
                  <div class="section">
                    <div class="section-header"><b>Experiencia Laboral</b></div>
                    ${Array.from(document.querySelectorAll("#experienciaContainer .dynamic-field-container"))
                      .map((exp) => {
                        const startDate = (exp.querySelector('input[type="month"]:first-of-type') as HTMLInputElement)
                          ?.value
                        const endDate = (exp.querySelector('input[type="month"]:last-of-type') as HTMLInputElement)?.value
                        return `
                          <div class="experience-item">
                            <div class="experience-header">
                              <strong>${(exp.querySelector('input[placeholder="Empresa"]') as HTMLInputElement)?.value}</strong>
                              <span class="experience-date">${formatDate(startDate, endDate)}</span>
                            </div>
                            <div>${(exp.querySelector('input[placeholder="Título del puesto"]') as HTMLInputElement)?.value}</div>
                            <div class="experience-description">${(exp.querySelector("textarea") as HTMLTextAreaElement)?.value}</div>
                          </div>
                        `
                      })
                      .join("")}
                  </div>
    
                  <div class="section">
                    <div class="section-header"><b>Formación Académica</b></div>
                    ${Array.from(document.querySelectorAll("#formacionContainer .dynamic-field-container"))
                      .map((form) => {
                        const startDate = (form.querySelector('input[type="month"]:first-of-type') as HTMLInputElement)
                          ?.value
                        const endDate = (form.querySelector('input[type="month"]:last-of-type') as HTMLInputElement)?.value
                        return `
                          <div class="education-item">
                            <div class="education-header">
                              <strong>${(form.querySelector('input[placeholder="Título/Grado"]') as HTMLInputElement)?.value}</strong>
                              <span class="education-date">${formatDate(startDate, endDate)}</span>
                            </div>
                            <div>${(form.querySelector('input[placeholder="Institución"]') as HTMLInputElement)?.value}</div>
                          </div>
                        `
                      })
                      .join("")}
                  </div>
                </div>
    
                <div class="right-column">
                  <div class="section">
                    <div class="section-header"><b>Idiomas</b></div>
                    ${Array.from(document.querySelectorAll('#selectedLanguages input[type="checkbox"]:checked'))
                      .map(
                        (checkbox) => `
                        <div class="language-item">
                          <span class="language-check">✓</span>
                          <span>${(checkbox.parentElement as HTMLLabelElement)?.textContent?.trim()}</span>
                        </div>
                      `,
                      )
                      .join("")}
                  </div>
    
                  <div class="section">
                    <div class="section-header"><b>Competencias</b></div>
                    ${Array.from(document.querySelectorAll("#competenciasContainer .dynamic-field-container"))
                      .map((comp) => {
                        const level = Number.parseInt(
                          (comp.querySelector('input[type="range"]') as HTMLInputElement)?.value || "0",
                        )
                        const percentage = (level / 10) * 100
                        return `
                          <div class="competency-item">
                            <div class="competency-name">${(comp.querySelector('input[placeholder="Competencia"]') as HTMLInputElement)?.value}</div>
                            <div class="competency-bar">
                              <div class="competency-level" style="width: ${percentage}%"></div>
                            </div>
                          </div>
                        `
                      })
                      .join("")}
                  </div>
    
                  <div class="section">
                    <div class="section-header"><b>Habilidades</b></div>
                    ${Array.from(document.querySelectorAll("#habilidadesContainer .dynamic-field-container"))
                      .map((habil) => {
                        const skillLevel = habil.querySelectorAll(".skill-point-selected").length
                        return `
                          <div class="skill-item">
                            <span>${(habil.querySelector('input[placeholder="Habilidad"]') as HTMLInputElement)?.value}</span>
                            <div class="skill-dots">
                              ${Array(5)
                                .fill(0)
                                .map(
                                  (_, i) => `
                                  <span class="skill-dot ${i >= skillLevel ? "empty" : ""}"></span>
                                `,
                                )
                                .join("")}
                            </div>
                          </div>
                        `
                      })
                      .join("")}
                  </div>
                </div>
              </div>
            `
    
    // Agregar el contenido al body
    document.body.appendChild(printContainer)
    
    // Imprimir y luego remover el contenido
    window.print()
    document.body.removeChild(printContainer)    
    document.head.removeChild(styleSheet)
  }

  experienciaFields: any[] = [];
  formacionFields: any[] = [];
  competenciasFields: any[] = [];
  habilidadesFields: any[] = [];

  // Método para agregar campos dinámicos
  addField(type: string): void {
    const newField = { id: type === 'habilidades' ? this.nextSkillId++ : Date.now() };

    switch (type) {
      case 'experiencia':
        this.experienciaFields.push(newField);
        break;
      case 'formacion':
        this.formacionFields.push(newField);
        break;
      case 'competencias':
        this.competenciasFields.push({ ...newField, level: 0 });
        break;
      case 'habilidades':
        this.habilidadesFields.push({ ...newField, level: 0 });
        // Wait for Angular to render the new field
        setTimeout(() => {
          this.setSkillLevel(this.habilidadesFields.length - 1, 0);
        }, 100);
        break;
    }
  }

  updateCompetenciaLevel(index: number, value: number): void {
    if (this.competenciasFields[index]) {
      this.competenciasFields[index].level = value;
      const rangeInput = document.querySelector(`#competenciasContainer .dynamic-field-container:nth-child(${index + 1}) input[type="range"]`) as HTMLInputElement;
      if (rangeInput) {
        rangeInput.style.setProperty('--value', `${(value / 10) * 100}%`);
      }
    }
  }

  constructor(private userService: UserDataService) {
    // Inicializar el manejador de eventos para el botón de ubicación
    setTimeout(() => {
      const showMapButton = document.getElementById('showMapButton');
      const saveLocationButton = document.getElementById('save-location');
      if (showMapButton) {
        showMapButton.addEventListener('click', () => {
          const mapContainer = document.getElementById('mapContainer');
          if (mapContainer) {
            // Toggle map visibility
            mapContainer.style.display = mapContainer.style.display === 'block' ? 'none' : 'block';
          }
        });
      }
      if (saveLocationButton) {
        saveLocationButton.addEventListener('click', () => this.saveLocation());
      }
    });
  }

  map!: L.Map;
  initialMapPosition: L.LatLngExpression = [10.23496307130874, -67.96323627233507];
  clickCount: number = 0;
  currentMarker: L.Marker | null = null;
  
  defaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    shadowSize: [41, 41],
    shadowAnchor: [12, 41]
  });

  ngOnInit(): void {

  
    this.token$.subscribe((token) => {
      if (token){
      const decodedToken = jwtDecode(token) as { id: number;};
        this.user = decodedToken;
      console.log('Token en el store:', token, this.user.id);}
      else{
        this.user = null;
    console.log('No hay token en el store');
      }
    });

    // Initialize location input as empty
    const ubicacionInput = document.getElementById('ubicacion') as HTMLInputElement;
    if (ubicacionInput) {
      ubicacionInput.value = '';
    }
    
    // Initialize map
    this.initializeMap();

    // Add event listeners for range inputs
    setTimeout(() => {
      const rangeInputs = document.querySelectorAll('#competenciasContainer input[type="range"]');
      rangeInputs.forEach((input, index) => {
        input.addEventListener('input', (event) => {
          const target = event.target as HTMLInputElement;
          const value = parseInt(target.value);
          this.updateCompetenciaLevel(index, value);
        });
      });
    }, 100);
  }

  initializeMap(): void {
    // Ensure map container is visible and has dimensions
    const mapContainer = document.getElementById('mapContainer');
    if (mapContainer) {
      mapContainer.style.display = 'block';
    }

    // Add slight delay to ensure DOM is fully rendered
    setTimeout(() => {
      const mapElement = document.getElementById('mew');
      if (mapElement) {
        mapElement.style.height = '400px';
        mapElement.style.width = '100%';
        mapElement.style.position = 'relative';
        mapElement.style.overflow = 'hidden';

        // Initialize map only if Leaflet is properly loaded
        if (typeof L !== 'undefined') {
          this.map = L.map('mew', {
            zoomControl: true,
            center: this.initialMapPosition,
            zoom: 13
          });

          // Add tile layer
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          }).addTo(this.map);

          // Add geocoder control
          const geocoder = new L.Control.Geocoder({
            position: 'topright',
            defaultMarkGeocode: false
          }).on('markgeocode', (e: any) => {
            const latlng = e.geocode.center;
            this.map.setView(latlng, 13);
            
            if (this.currentMarker) {
              this.map.removeLayer(this.currentMarker);
            }
            
            this.currentMarker = L.marker(latlng, { icon: this.defaultIcon })
              .addTo(this.map)
              .bindPopup("Ubicación seleccionada")
              .openPopup();

            const locationInfo = document.getElementById('location-info');
            const fullLocation = document.getElementById('full-location') as HTMLTextAreaElement;
            
            if (locationInfo && fullLocation) {
              locationInfo.innerHTML = `
                Número de clics: ${this.clickCount}<br>
                Ciudad: ${e.geocode.properties.city || '-'}<br>
                Estado: ${e.geocode.properties.state || '-'}<br>
                País: ${e.geocode.properties.country || '-'}<br>
                Latitud: ${latlng.lat.toFixed(14)}<br>
                Longitud: ${latlng.lng.toFixed(14)}
              `;
              fullLocation.value = e.geocode.properties.display_name;
            }
          }).addTo(this.map);

          // Add click handler for map

          this.map.on('click', async (e: L.LeafletMouseEvent) => {
            const latlng = e.latlng;
            this.clickCount++;
            
            // Remove previous marker if exists
            if (this.currentMarker) {
              this.map.removeLayer(this.currentMarker);
            }

            // Crear marcador con icono por defecto
            this.currentMarker = L.marker(latlng, { icon: this.defaultIcon })
              .addTo(this.map)
              .bindPopup("Ubicación seleccionada")
              .openPopup();

            // Center map on clicked location
            this.map.setView(latlng, this.map.getZoom());

            try {
              // Use Nominatim API directly
              const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${latlng.lat}&lon=${latlng.lng}&format=json`
              );
              const data = await response.json();
              
              const city = data.address.city || data.address.town || data.address.village || '-';
              const state = data.address.state || '-';
              const country = data.address.country || '-';

              // Update location info
              const locationInfo = document.getElementById('location-info');
              const fullLocation = document.getElementById('full-location') as HTMLTextAreaElement;
              
              if (locationInfo) {
                locationInfo.innerHTML = `
                  Número de clics: ${this.clickCount}<br>
                  Ciudad: ${city}<br>
                  Estado: ${state}<br>
                  País: ${country}<br>
                  Latitud: ${latlng.lat.toFixed(14)}<br>
                  Longitud: ${latlng.lng.toFixed(14)}
                `;
              }

              if (fullLocation) {
              fullLocation.value = `${city}, ${state}, ${country}`;
            }
          } catch (error) {
            console.error('Error al obtener datos de geocodificación:', error);
          }
          });
        }
      }
    }, 50);
  }

  saveLocation(): void {
    const locationInput = document.getElementById('ubicacion') as HTMLInputElement;
    const fullLocation = document.getElementById('full-location') as HTMLTextAreaElement;
    if (locationInput && fullLocation) {
      locationInput.value = fullLocation.value;
      localStorage.setItem('ubicacion', fullLocation.value);

      const mapContainer = document.getElementById('mapContainer');
      if (mapContainer) {
        mapContainer.style.display = 'none';
      }
    }
  }

  setSkillLevel(index: number, level: number): void {
    const skillContainer = document.querySelector(`#habilidadesContainer .dynamic-field-container:nth-child(${index})`);

    if (!skillContainer) {
      console.error('Skill container not found for index:', index);
      console.log('Current habilidadesFields:', this.habilidadesFields);
      return;
    }

    const skillPoints = skillContainer.querySelectorAll('.skill-point');
    
    skillPoints.forEach((point, i) => {
      if (i < level) {
        point.classList.add('skill-point-selected');
      } else {
        point.classList.remove('skill-point-selected');
      }
    });

    const skillLevelInput = skillContainer.querySelector('input[type="hidden"]') as HTMLInputElement;
    if (skillLevelInput && skillLevelInput instanceof HTMLInputElement) {
      skillLevelInput.value = level.toString();
    }
  }

  deleteField(fieldId: number, type: string): void {
    switch (type) {
      case 'experiencia':
        this.experienciaFields = this.experienciaFields.filter(f => f.id !== fieldId);
        break;
      case 'formacion':
        this.formacionFields = this.formacionFields.filter(f => f.id !== fieldId);
        break;
      case 'competencias':
        this.competenciasFields = this.competenciasFields.filter(f => f.id !== fieldId);
        break;
      case 'habilidades':
        this.habilidadesFields = this.habilidadesFields.filter(f => f.id !== fieldId);
        this.nextSkillId -=1;
        break;
    }
    console.log(`Field ${fieldId} removed successfully`);
  }
}
