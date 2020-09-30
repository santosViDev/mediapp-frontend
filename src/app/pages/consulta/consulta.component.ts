import { ConsultaService } from './../../_service/consulta.service';
import { ConsultaListaExamenDTO } from './../../_dto/consultaListaExamenDTO';
import { Consulta } from './../../_model/consulta';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Examen } from './../../_model/examen';
import { DetalleConsulta } from './../../_model/detalleConsulta';
import { Especialidad } from './../../_model/especialidad';
import { ExamenService } from './../../_service/examen.service';
import { EspecialidadService } from './../../_service/especialidad.service';
import { MedicoService } from './../../_service/medico.service';
import { Medico } from './../../_model/medico';
import { PacienteService } from './../../_service/paciente.service';
import { Paciente } from './../../_model/paciente';
import { Component, OnInit } from '@angular/core';
import { Observable, EMPTY } from 'rxjs';
import * as moment from 'moment';

@Component({
  selector: 'app-consulta',
  templateUrl: './consulta.component.html',
  styleUrls: ['./consulta.component.css']
})
export class ConsultaComponent implements OnInit {

  pacientes: Paciente[];
  pacientes$: Observable<Paciente[]>;
  medicos$: Observable<Medico[]>;
  especialidades$: Observable<Especialidad[]>;
  examenes$: Observable<Examen[]>;

  idPacienteSeleccionado: number;
  idEspecialidadSeleccionado: number;
  idMedicoSeleccionado: number;
  idExamenSeleccionado: number;

  maxFecha: Date = new Date();
  fechaSeleccionada: Date = new Date();

  diagnostico: string;
  tratamiento: string;

  detalleConsulta: DetalleConsulta[] = [];
  examenesSeleccionados: Examen[] = [];

  constructor(
    private pacienteService: PacienteService,
    private medicoService: MedicoService,
    private especialidadService: EspecialidadService,
    private examenService: ExamenService,
    private consultaService: ConsultaService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    //this.listarPacientes();
    this.listarPacientes$();
    this.listarMedicos$();
    this.listarEspecialidades$();
    this.listarExamenes$();
  }

  listarPacientes() {
    this.pacienteService.listar().subscribe(data => {
      this.pacientes = data;
    });
  }

  listarPacientes$() {
    this.pacientes$ = this.pacienteService.listar(); //EMPTY; 
  }

  listarMedicos$() {
    this.medicos$ = this.medicoService.listar(); //EMPTY; 
  }

  listarEspecialidades$() {
    this.especialidades$ = this.especialidadService.listar(); //EMPTY; 
  }

  listarExamenes$() {
    this.examenes$ = this.examenService.listar(); //EMPTY; 
  }

  cambieFecha(e: any) {
    console.log(e);
  }

  agregar() {
    if (this.diagnostico != null && this.tratamiento != null) {
      let det = new DetalleConsulta();
      det.diagnostico = this.diagnostico;
      det.tratamiento = this.tratamiento;
      this.detalleConsulta.push(det);

      this.diagnostico = null;
      this.tratamiento = null;
    }
  }

  removerDiagnostico(index: number) {
    this.detalleConsulta.splice(index, 1);
  }

  agregarExamen() {
    if (this.idExamenSeleccionado > 0) {

      let cont = 0;
      for (let i = 0; i < this.examenesSeleccionados.length; i++) {
        let examen = this.examenesSeleccionados[i];
        if (examen.idExamen === this.idExamenSeleccionado) {
          cont++;
          break;
        }
      }

      if (cont > 0) {
        let mensaje = 'El examen se encuentra en la lista';
        this.snackBar.open(mensaje, "Aviso", { duration: 2000 });
      } else {
        let examen = new Examen();
        examen.idExamen = this.idExamenSeleccionado;

        this.examenService.listarPorId(this.idExamenSeleccionado).subscribe(data => {
          examen.nombre = data.nombre;
          examen.descripcion = data.descripcion;
          this.examenesSeleccionados.push(examen);
        });
      }
    }
  }

  removerExamen(index: number) {
    this.examenesSeleccionados.splice(index, 1);
  }

  estadoBotonRegistrar() {
    return (this.detalleConsulta.length === 0 || this.idEspecialidadSeleccionado === 0 || this.idMedicoSeleccionado === 0 || this.idPacienteSeleccionado === 0);
  }

  aceptar() {
    let medico = new Medico();
    medico.idMedico = this.idMedicoSeleccionado;

    let especialidad = new Especialidad();
    especialidad.idEspecialidad = this.idEspecialidadSeleccionado;

    let paciente = new Paciente();
    paciente.idPaciente = this.idPacienteSeleccionado;

    let consulta = new Consulta();
    consulta.especialidad = especialidad;
    consulta.medico = medico;
    consulta.paciente = paciente;
    consulta.numConsultorio = "C1";

    //ISODate | Cambio    
    let tzoffset = (new Date()).getTimezoneOffset() * 60000;
    let localISOTime = (new Date(this.fechaSeleccionada.getTime() - tzoffset)).toISOString();    

    consulta.fecha = moment(this.fechaSeleccionada).format('YYYY-MM-DDTHH:mm:ss');
   
    consulta.detalleConsulta = this.detalleConsulta;

    let consultaListaExamenDTO = new ConsultaListaExamenDTO();
    consultaListaExamenDTO.consulta = consulta;
    consultaListaExamenDTO.lstExamen = this.examenesSeleccionados;

    
    this.consultaService.registrarTransaccion(consultaListaExamenDTO).subscribe(() => {
      this.snackBar.open("Se registró", "Aviso", { duration: 2000 });

      setTimeout(() => {
        this.limpiarControles();
      }, 2000);

    });
  }

  limpiarControles() {
    this.detalleConsulta = [];
    this.examenesSeleccionados = [];
    this.diagnostico = '';
    this.tratamiento = '';
    this.idPacienteSeleccionado = 0;
    this.idEspecialidadSeleccionado = 0;
    this.idMedicoSeleccionado = 0;
    this.idExamenSeleccionado = 0;
    this.fechaSeleccionada = new Date();
    this.fechaSeleccionada.setHours(0);
    this.fechaSeleccionada.setMinutes(0);
    this.fechaSeleccionada.setSeconds(0);
    this.fechaSeleccionada.setMilliseconds(0);
  }
}
