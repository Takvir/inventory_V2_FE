import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RepairService } from 'src/app/services/repari/repair.service';

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

@Component({
  selector: 'app-repair-list',
  templateUrl: './repair-list.component.html',
  styleUrls: ['./repair-list.component.css']
})
export class RepairListComponent implements OnInit {

  repairs: Repair[] = [];
  filteredRepairs: Repair[] = [];
  repairForm: FormGroup;
  selectedRepair?: Repair;
  isModalOpen: boolean = false;
  startDate: string = '';
  endDate: string = '';
  searchTerm: string = '';

  constructor(
    private repairService: RepairService,
    private fb: FormBuilder
  ) {
    this.repairForm = this.fb.group({
      asset_id: [null, Validators.required],
      repair_date: ['', Validators.required],
      repair_cost: [null, Validators.required],
      repair_status: ['', Validators.required],
      repair_notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadRepairs();
  }

  loadRepairs(): void {
    this.repairService.getRepairs().subscribe({
      next: (data) => {
        this.repairs = data;
        this.filteredRepairs = data; // Initialize with all repairs
      },
      error: (err) => {
        console.error('Error loading repairs:', err);
      }
    });
  }

  filterByDate(): void {
    const start = new Date(this.startDate).getTime();
    const end = new Date(this.endDate).getTime();

    this.filteredRepairs = this.repairs.filter(repair => {
      const repairDate = new Date(repair.repair_date).getTime();
      return repairDate >= start && repairDate <= end;
    });
  }

  openEditModal(repair: Repair): void {
    this.selectedRepair = { ...repair };
    const formattedDate = new Date(repair.repair_date).toISOString().split('T')[0];
    this.repairForm.patchValue({
      asset_id: repair.asset_id,
      repair_date: formattedDate,
      repair_cost: repair.repair_cost,
      repair_status: repair.repair_status,
      repair_notes: repair.repair_notes
    });
    this.isModalOpen = true;

    console.log('click');
    
  }

  closeEditModal(): void {
    this.isModalOpen = false;
    this.repairForm.reset();
    this.selectedRepair = undefined;
  }

  saveRepair(): void {
    if (this.repairForm.valid && this.selectedRepair) {
      const repairData: Repair = this.repairForm.value;
      repairData.repair_date = new Date(repairData.repair_date).toISOString();
      this.repairService.updateRepair(this.selectedRepair.repair_id!, repairData).subscribe({
        next: () => {
          this.loadRepairs();
          this.closeEditModal();
        },
        error: (err) => {
          console.error('Error updating repair:', err);
        }
      });
    }
  }

  deleteRepair(id: number): void {
    if (confirm('Are you sure you want to delete this repair?')) {
      this.repairService.deleteRepair(id).subscribe({
        next: () => {
          this.loadRepairs();
        },
        error: (err) => {
          console.error('Error deleting repair:', err);
        }
      });
    }
  }

  searchRepairs(): void {
    const lowerTerm = this.searchTerm.toLowerCase();
    this.filteredRepairs = this.repairs.filter(repair =>
      repair.branch_name.toLowerCase().includes(lowerTerm) ||
      repair.group_name.toLowerCase().includes(lowerTerm) ||
      repair.desktop_name.toLowerCase().includes(lowerTerm) ||
      repair.serial_number.toLowerCase().includes(lowerTerm) ||
      repair.tag_name.toLowerCase().includes(lowerTerm) ||
      repair.repair_status.toLowerCase().includes(lowerTerm) ||
      repair.repair_notes.toLowerCase().includes(lowerTerm)
    );
  }


  resetPage(): void {
    window.location.reload();
  }

  downloadCSV(): void {
    const headers = ['Repair ID', 'Location', 'Group Name', 'Asset Name', 'Serial Number', 'Tag Number', 'Repair Date', 'Repair Cost', 'Repair Status', 'Repair Notes'];
    const csvRows = this.filteredRepairs.map(repair => [
      repair.repair_id,
      repair.branch_name,
      repair.group_name,
      repair.desktop_name,
      repair.serial_number,
      repair.tag_name,
      new Date(repair.repair_date).toLocaleDateString(),
      repair.repair_cost,
      repair.repair_status,
      repair.repair_notes
    ]);
  
    const csvContent = [
      headers.join(','), // Headers row
      ...csvRows.map(row => row.join(',')) // Data rows
    ].join('\n');
  
    // Create a Blob from the CSV content
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
  
    // Create a link element to trigger the download
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'repair_list.csv');
  
    // Append the link to the document and click it
    document.body.appendChild(link);
    link.click();
  
    // Clean up
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  
}
