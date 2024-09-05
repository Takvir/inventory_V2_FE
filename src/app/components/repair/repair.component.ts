import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BranchService } from 'src/app/services/branch/branch.service';
import { GroupService } from 'src/app/services/group/group.service';
import { TagAssetService,  } from 'src/app/services/tag-asset/tag-asset.service';
import { RepairService } from 'src/app/services/repari/repair.service';



export interface Asset {
  asset_id: number;
  branch_id: number;
  branch_name: string;
  group_id: number;
  group_name: string;
  desktop_name: string;
  configuration: string;
  tag_name: string;
  warranty: string;
  price: number;
  purchase_date: Date;
  status: string;
  asset_get_by: string;
  serial_number: string;
  sub_branch: string;
  OS: string;
  RAM: string;
  Storage: string;
  work_order: string;
  challan_no: string;

}

export interface Branch {
  branch_id: number;
  branch_name: string;
}

export interface Group {
  group_id: number;
  group_name: string;
  branch_id: number;
}
export interface Group2 {
  group_id: number;
  group_name: string;
  stock_in_hand: number;
  user_group: string;
}

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
  selector: 'app-repair',
  templateUrl: './repair.component.html',
  styleUrls: ['./repair.component.css']
})
export class RepairComponent implements OnInit {

  assets: Asset[] = [];
  viewAssetsForm!: FormGroup;
  repairForm!: FormGroup;
  repairs: Repair[] = [];

  branches: Branch[] = [];
  groups: Group2[] = [];
  subBranchOptions: string[] = [];

  isBranchUser: boolean = false;
  isBranchDisabled = true;
  isSubBranchDisabled = true;
  isGroupDisabled = true;
  
  isEdit: boolean = false;
  isEditMode: boolean = false;
  noDataFound: boolean = false;
  loading: boolean = false;
  totalRepair: number = 0;

  constructor(
    private tagService: TagAssetService,
    private branchService: BranchService,
    private groupService: GroupService,
    private repairService: RepairService,
    private fb: FormBuilder
  ) {
    this.viewAssetsForm = this.fb.group({
      branch_id: ['', Validators.required],
      group_id: ['', Validators.required],
      sub_branch: [{ value: '', disabled: this.isSubBranchDisabled }]
    });

    this.repairForm = this.fb.group({
      
      repair_id: [null, Validators.required],
      asset_id: [null, Validators.required],
      repair_date: [null, Validators.required],
      repair_cost: [null, [Validators.required, Validators.pattern('^[0-9]+(\\.[0-9]{1,2})?$')]],
      repair_status: [null, Validators.required],
      repair_notes: [null]
    });
  }

   ngOnInit(): void {
    this.repairForm.get('asset_id')?.valueChanges.subscribe(value => {
      this.repairForm.get('repair_id')?.setValue(value);
    });

    

    
    

    this.loadRepairs();
    this.loadBranches();
    this.loadGroups();

    const userType = localStorage.getItem('user_type');
    if (userType === 'branch') {
      this.isBranchUser = true;
      this.viewAssetsForm.get('branch_id')?.setValidators(Validators.required);
      this.viewAssetsForm.get('branch_id')?.updateValueAndValidity();
    }

    // this.editAssetForm.get('branch_id')?.disable();
    // this.editAssetForm.get('group_id')?.disable();
    // this.editAssetForm.get('sub_branch')?.disable();

    this.isBranchDisabled = true;
  }

  loadRepairs(): void {
    const branchId = localStorage.getItem('branch_id');
    
    if (branchId) {
      const branchIdNum = parseInt(branchId, 10);
      
      this.repairService.getRepairs().subscribe({
        next: (data: Repair[]) => {
          // Assuming you have a branch_id field in your Repair model that you can filter by
          this.repairs = data.filter(repair => repair.branch_id === branchIdNum);

          this.totalRepair = this.repairs.length;
          
          // Alternatively, if the branch_id is related to the assets in repairs, you can do something like:
          // this.repairs = data.filter(repair => this.assets.some(asset => asset.asset_id === repair.asset_id && asset.branch_id === branchIdNum));
  
          console.log('Repairs filtered by branch:', this.repairs);
        },
        error: (err) => {
          console.error('Error loading repairs:', err);
        }
      });
    } else {
      console.error('Branch ID not found in local storage');
    }
  }
  

  editRepair(repair: Repair): void {
    this.repairForm.patchValue({
      repair_id: repair.repair_id ?? null,  // Ensure repair_id is either a number or null
      asset_id: repair.asset_id,
      repair_date: repair.repair_date,
      repair_cost: repair.repair_cost,
      repair_status: repair.repair_status,
      repair_notes: repair.repair_notes
    });
    this.isEditMode = true;
  }
  
  openRepairModal(asset: any) {
    this.isEdit = true;
    this.isEditMode = true;  // Set this to true if you're editing an existing entry

    // Populate the form with asset data if you're editing
    this.repairForm.patchValue({
      
      asset_id: asset.asset_id,
      repair_date: asset.repair_date || '',
      repair_cost: asset.repair_cost || '',
      repair_status: asset.repair_status || 'Pending',
      repair_notes: asset.repair_notes || ''
    });
  }

  saveRepair(): void {
    if (this.repairForm.valid) {
      const repairData: Repair = this.repairForm.value;
      repairData.asset_id = repairData.asset_id || 0; // Ensure asset_id is set correctly
      
      console.log('Repair Data before creating repair:', repairData);
  
      this.repairService.createRepair(repairData).subscribe({
        next: (response) => {
          console.log('Repair created successfully:', response);
          this.loadRepairs();
          this.clearForm();
          window.confirm('Repair Created Successfully!');
          // this.closeModal();
        },
        error: (error) => {
          console.error('Error creating repair:', error);
        }
      });
    }
  }
  
  
  

  deleteRepair(id: number): void {
    if (id) {
      this.repairService.deleteRepair(id).subscribe({
        next: (response) => {
          console.log('Repair deleted successfully:', response);
          this.loadRepairs();
        },
        error: (error) => {
          console.error('Error deleting repair:', error);
        }
      });
    } else {
      console.error('Repair ID is not defined or is null');
    }
  }

  clearForm(): void {
    this.repairForm.reset();
    this.isEditMode = false;
  }

  closeModal() {
    this.isEdit = false;
  }

  loadBranches(): void {
    this.branchService.getBranches().subscribe((data: Branch[]) => {
      const userType = localStorage.getItem('user_type');

      if (userType === 'superadmin') {
        this.branches = data;
      } else {
        const branchId = localStorage.getItem('branch_id');
        if (branchId) {
          const branchIdNum = parseInt(branchId, 10);
          this.branches = data.filter(branch => branch.branch_id === branchIdNum );
        } else {
          this.branches = []; // Or any default behavior if no branch ID is set
        }
      }
    });
  }

  loadGroups(): void {
    this.groupService.getGroups2().subscribe(data => {
      const userType = localStorage.getItem('user_type');
  
     
      console.log('User Type:', userType);
  
      if (userType === 'branch') {
       this.groups = data.filter(group => group.user_group === 'branch');
      } else {
        
        this.groups = data;
      }
  
      console.log('Filtered Groups:', this.groups);
    });
  }

  onBranchChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;

    const selectedBranchId = parseInt(selectElement.value, 10);
    const selectedBranch = this.branches.find(branch => branch.branch_id === selectedBranchId);

    if (selectedBranch && selectedBranch.branch_name === 'Head Office') {
      this.subBranchOptions = [
        'Select Division',
        'Chairman Sir & MD & CEO Office',
        'Agent Banking',
        'AML & CFT',
        'ICT',
        'ADC',
        'Card Division'
      ];
      this.viewAssetsForm.get('sub_branch')?.enable();
    } else {
      this.subBranchOptions = ['Select Division'];
      this.viewAssetsForm.get('sub_branch')?.disable();
      this.viewAssetsForm.patchValue({ sub_branch: 'Select Division' });
    }
  }

  loadAssets(): void {
    const { branch_id, group_id, sub_branch } = this.viewAssetsForm.value;
    this.noDataFound = false;
    this.loading = true;

    if (branch_id && group_id && sub_branch && sub_branch !== 'Select Division') {
      this.tagService.getAssetsByBranchGroupAndSubBranch(branch_id, group_id, sub_branch).subscribe({
        next: (data: Asset[]) => {
          this.assets = data;
          this.noDataFound = data.length === 0;
        },
        error: (error) => {
          console.error('Error loading assets:', error);
          this.noDataFound = true;
        }
      });
    } else if (branch_id && sub_branch && sub_branch !== 'Select Division') {
      this.tagService.getAssetsByBranchAndSubBranch(branch_id, sub_branch).subscribe({
        next: (data: Asset[]) => {
          this.assets = data;
          this.noDataFound = data.length === 0;
        },
        error: (error) => {
          console.error('Error loading assets:', error);
          this.noDataFound = true;
        }
      });
    } else if (branch_id && group_id) {
      this.tagService.getAssetsByBranchAndGroup(branch_id, group_id).subscribe({
        next: (data: Asset[]) => {
          this.assets = data;
          this.noDataFound = data.length === 0;
        },
        error: (error) => {
          console.error('Error loading assets:', error);
          this.noDataFound = true;
        }
      });
    } else if (branch_id) {
      this.tagService.getAssetsByBranch(branch_id).subscribe({
        next: (data: Asset[]) => {
          this.assets = data;
          this.noDataFound = data.length === 0;
        },
        error: (error) => {
          console.error('Error loading assets:', error);
          this.noDataFound = true;
        }
      });
    } else if (group_id) {
      this.tagService.getAssetsByGroup(group_id).subscribe({
        next: (data: Asset[]) => {
          this.assets = data;
          this.noDataFound = data.length === 0;
        },
        error: (error) => {
          console.error('Error loading assets:', error);
          this.noDataFound = true;
        }
      });
    }
  }


 



  isFAD(tagName: string): boolean {
    return tagName === 'Routed To FAD';
  }

  isValueNaN(value: any): boolean {
    return isNaN(value);
  }
  isValidDate(date: any): boolean {
    return date instanceof Date && !isNaN(date.getTime());
  }

  isRoutedToCSD(date: any): boolean {
    return typeof date === 'string' && date === 'Routed To CSD';
  }
  


  calculateAssetValue(purchaseDate: Date, price: number): number {
    const currentDate = new Date();
    const purchaseDateObj = new Date(purchaseDate);
    const yearsSincePurchase = (currentDate.getTime() - purchaseDateObj.getTime()) / (1000 * 3600 * 24 * 365);

    if (yearsSincePurchase > 5) {
      return 0;
    } else if (yearsSincePurchase > 4) {
      return price * 0.30; // 70% less
    } else if (yearsSincePurchase > 3) {
      return price * 0.50; // 50% less
    } else if (yearsSincePurchase > 2) {
      return price * 0.70; // 30% less
    } else if (yearsSincePurchase > 1) {
      return price * 0.80; // 20% less
    } else {
      return price * 0.90; // 10% less
    }
  }
}