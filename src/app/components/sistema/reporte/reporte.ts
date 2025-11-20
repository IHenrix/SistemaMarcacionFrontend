import { Component, OnInit, inject } from '@angular/core';
import { SharedImports } from '@app/shared/shared.imports';
import { MarcacionReporteItem, MarcacionService } from '@app/services/marcacion.service';
import { UsuarioService } from '@app/services/usuario.service';
import { PersonaAsignacionDTO } from '@app/models/usuario.model';

@Component({
  selector: 'app-reporte',
  standalone: true,
  imports: [SharedImports],
  templateUrl: './reporte.html',
  styleUrls: ['./reporte.scss'],
})
export class ReporteComponent implements OnInit {
  private readonly marcacionService = inject(MarcacionService);
  private readonly usuarioService = inject(UsuarioService);

  protected tab: 'personal' | 'general' = 'personal';
  protected cargando = false;

  protected filtrosPersonal = {
    desde: '',
    hasta: '',
    tardanza: '',
  };

  protected filtrosGeneral = {
    id_persona: null as number | null,
    personaTerm: '',
    desde: '',
    hasta: '',
    tardanza: '',
  };

  protected personas: PersonaAsignacionDTO[] = [];
  protected resultadosPersonal: MarcacionReporteItem[] = [];
  protected resultadosGeneral: MarcacionReporteItem[] = [];

  ngOnInit(): void {
    this.cargarPersonas();
    this.buscarPersonal();
  }

  protected setTab(tab: 'personal' | 'general') {
    this.tab = tab;
    if (tab === 'personal' && this.resultadosPersonal.length === 0) {
      this.buscarPersonal();
    }
    if (tab === 'general' && this.resultadosGeneral.length === 0) {
      this.buscarGeneral();
    }
  }

  protected buscarPersonal(): void {
    this.cargando = true;
    this.marcacionService
      .reporte({
        personal: true,
        desde: this.filtrosPersonal.desde || undefined,
        hasta: this.filtrosPersonal.hasta || undefined,
        tardanza: this.parseTardanza(this.filtrosPersonal.tardanza),
      })
      .subscribe({
        next: (res) => {
          this.resultadosPersonal = res.data || [];
          this.cargando = false;
        },
        error: () => (this.cargando = false),
      });
  }

  protected limpiarPersonal(): void {
    this.filtrosPersonal = { desde: '', hasta: '', tardanza: '' };
    this.buscarPersonal();
  }

  protected buscarGeneral(): void {
    this.cargando = true;
    this.marcacionService
      .reporte({
        id_persona: this.filtrosGeneral.id_persona || undefined,
        desde: this.filtrosGeneral.desde || undefined,
        hasta: this.filtrosGeneral.hasta || undefined,
        tardanza: this.parseTardanza(this.filtrosGeneral.tardanza),
      })
      .subscribe({
        next: (res) => {
          this.resultadosGeneral = res.data || [];
          this.cargando = false;
        },
        error: () => (this.cargando = false),
      });
  }

  protected limpiarGeneral(): void {
    this.filtrosGeneral = { id_persona: null, personaTerm: '', desde: '', hasta: '', tardanza: '' };
    this.buscarGeneral();
  }

  protected seleccionarPersona(id: number | null) {
    this.filtrosGeneral.id_persona = id;
  }

  protected onPersonaInput(term: string) {
    this.filtrosGeneral.personaTerm = term;
    const encontrada = this.personas.find(
      (p) =>
        this.displayPersona(p).toLowerCase() === term.trim().toLowerCase() ||
        (p.dni && p.dni === term.trim())
    );
    this.filtrosGeneral.id_persona = encontrada ? encontrada.id_persona : null;
  }

  protected personasFiltradas(): PersonaAsignacionDTO[] {
    const term = this.filtrosGeneral.personaTerm.trim().toLowerCase();
    if (!term) return this.personas;
    return this.personas.filter(
      (p) =>
        p.nombres.toLowerCase().includes(term) ||
        p.apellidos.toLowerCase().includes(term) ||
        (p.dni || '').toLowerCase().includes(term)
    );
  }

  protected displayPersona(p: PersonaAsignacionDTO): string {
    return `${p.nombres} ${p.apellidos} - ${p.dni || ''}`.trim();
  }

  protected estadoTexto(item: MarcacionReporteItem): string {
    if (!item.entrada) return 'Pendiente';
    if (item.tardanza) return `Tardanza (+${item.minutos_tarde} min)`;
    return 'A tiempo';
  }

  private parseTardanza(valor: string): boolean | undefined {
    if (valor === '1') return true;
    if (valor === '0') return false;
    return undefined;
  }

  private cargarPersonas(): void {
    this.usuarioService.listarUsuarios().subscribe({
      next: (res) => (this.personas = res.data || []),
      error: () => (this.personas = []),
    });
  }
}
