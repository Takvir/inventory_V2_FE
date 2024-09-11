import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Repair {
  repair_id?: number;
  asset_id: number;
  repair_date: string;
  repair_cost: number;
  repair_status: string;
  repair_notes: string;
  desktop_name : string;
  group_name : string;
  branch_name : string;
  serial_number: string;
  tag_name: string;
  branch_id: number;
}



@Injectable({
  providedIn: 'root'
})

export class RepairService {
  private apiUrl = 'http://11.11.7.41:3000/api/repairs';

  constructor(private http: HttpClient) {}

  

  getRepairs(): Observable<Repair[]> {
    return this.http.get<Repair[]>(this.apiUrl);
  }

  getRepairById(id: number): Observable<Repair> {
    return this.http.get<Repair>(`${this.apiUrl}/${id}`);
  }

  createRepair(repair: Repair): Observable<Repair> {
    return this.http.post<Repair>(this.apiUrl, repair);
  }

  updateRepair(id: number, repair: Repair): Observable<Repair> {
    return this.http.put<Repair>(`${this.apiUrl}/${id}`, repair);
  }

  deleteRepair(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
