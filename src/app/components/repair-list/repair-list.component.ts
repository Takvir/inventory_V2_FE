import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BranchService } from 'src/app/services/branch/branch.service';
import { GroupService } from 'src/app/services/group/group.service';
import { TagAssetService,  } from 'src/app/services/tag-asset/tag-asset.service';
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
  repairForm: FormGroup;
  selectedRepair?: Repair;
  isModalOpen: boolean = false;

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
      },
      error: (err) => {
        console.error('Error loading repairs:', err);
      }
    });
  }

  openEditModal(repair: Repair): void {
    this.selectedRepair = { ...repair };
    // Convert repair_date to YYYY-MM-DD format for input field
    const formattedDate = new Date(repair.repair_date).toISOString().split('T')[0];
    this.repairForm.patchValue({
      asset_id: repair.asset_id,
      repair_date: formattedDate,
      repair_cost: repair.repair_cost,
      repair_status: repair.repair_status,
      repair_notes: repair.repair_notes
    });
    this.isModalOpen = true;
  }

  closeEditModal(): void {
    this.isModalOpen = false;
    this.repairForm.reset();
    this.selectedRepair = undefined;
  }

  saveRepair(): void {
    if (this.repairForm.valid && this.selectedRepair) {
      const repairData: Repair = this.repairForm.value;
      // Convert date back to ISO string if needed by your API
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
}