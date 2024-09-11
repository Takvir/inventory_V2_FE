import { Component, OnInit } from '@angular/core';
import { SectionService } from 'src/app/services/section/section.service';
import { BranchService } from 'src/app/services/branch/branch.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GroupService } from 'src/app/services/group/group.service';
import { HttpClient } from '@angular/common/http';


interface Asset {
  id: number;
  branch_id: number;
  branch_name: string;
  group_id: number;
  desktop_name: string;
  configuration: string;
  tag_name: string;
  warranty: string;
  price: number;
  purchase_date: string;
  status: string;
  asset_get_by: string;
  serial_number: string;
  group_name: string;
  sub_branch: string;
  OS?: string;
  RAM?: string;
  Storage?: string;
  work_order?: string;
  challan_no?: string;
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


@Component({
  selector: 'app-old-equipment',
  templateUrl: './old-equipment.component.html',
  styleUrls: ['./old-equipment.component.css']
})
export class OldEquipmentComponent implements OnInit {

  assets: Asset[] = [];
  assetForm!: FormGroup;
  isEdit: boolean = false;
  editAssetId: number | null = null;
  branches: Branch[] = [];
 
  subBranchOptions: string[] = [];
  selectedFile: File | null = null;
  uploadForm!: FormGroup;
  groups: Group2[] = [];
  isCpuGroup: boolean = false;
  isLaptopGroup: boolean = false;
  isMonitorGroup: boolean = false;
  isScannerrGroup: boolean = false;
  isPrinterBrtaGroup: boolean = false;
  isPrinterBranchGroup: boolean = false;
  isIpPhoneSetGroup: boolean = false;
  isOfflineUpsGroup: boolean = false;


  deviceOptions: string[] = [];
  configOptions: string[] = [];
  osOptions: string[] = [];
  ramOptions: string[] = [];
  storageOptions: string[] = [];
  
  constructor(
    private assetService: SectionService,
    private branchService: BranchService,
    private groupService: GroupService,
    private fb: FormBuilder,
    private http: HttpClient,
  ) {
    this.assetForm = this.fb.group({
      branch_id: ['', Validators.required],
      branch_name: ['', Validators.required],
      group_id: ['', Validators.required],
      desktop_name: ['', Validators.required],
      configuration: ['', Validators.required],
      tag_name: ['', Validators.required],
      warranty: ['Routed To CSD', Validators.required],
      price: ['Routed To CSD', Validators.required],
      purchase_date: ['Routed To CSD', Validators.required],
      status: ['', Validators.required],
      asset_get_by: ['', Validators.required],
      serial_number: ['', Validators.required],
      sub_branch: ['', Validators.required],
      OS: ['', Validators.required],
      RAM: ['', Validators.required],
      Storage: ['', Validators.required],
      work_order: ['Routed To CSD', Validators.required],
      challan_no: ['Routed To CSD', Validators.required],
    });

    this.uploadForm = this.fb.group({
      file: [null]
    });
  }

  ngOnInit(): void {
    this.loadBranches();
    this.loadGroups();
    this.loadAssets();
    this.setBranchFromLocalStorage();
  }


  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.uploadForm.patchValue({
        file: file
      });
    }
  }
  

  uploadFile() {
    if (!this.selectedFile) {
      console.error('No file selected.');
      return;
    }
  
    const formData = new FormData();
    formData.append('file', this.selectedFile);
  
    this.http.post('http://localhost:3000/api/assets/upload', formData)
      .subscribe({
        next: response => {
          console.log('Upload successful', response);
        },
        error: error => {
          console.error('Error uploading file', error);
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

  loadAssets(): void {
    this.assetService.getAssets().subscribe(assets => {
      this.assets = assets;
    });
  }

  setBranchFromLocalStorage(): void {
    const branchId = localStorage.getItem('branch_id');
    if (branchId) {
      const branchIdNum = parseInt(branchId, 10);
      const selectedBranch = this.branches.find(branch => branch.branch_id === branchIdNum);
      if (selectedBranch) {
        this.assetForm.patchValue({
          branch_id: selectedBranch.branch_id,
          branch_name: selectedBranch.branch_name
        });

        this.onBranchChange({ target: { value: selectedBranch.branch_id } } as unknown as Event); // Trigger branch change handler
      }
    }
  }
  onSubmit(): void {
    if (this.assetForm.invalid) {
      return;
    }

    const asset: Asset = this.assetForm.value;
    console.log('Form Value:', asset);

    if (this.isEdit && this.editAssetId !== null) {
      this.assetService.updateAsset(this.editAssetId, asset).subscribe(() => {
        this.loadAssets();
        this.resetForm();
        window.confirm('Asset updated successfully!');
      });
    } else {
      this.assetService.addAsset(asset).subscribe(() => {
        this.loadAssets();
        this.resetForm();
        window.confirm('Asset added successfully!');
      });
    }
  }

  onEdit(asset: Asset): void {
    this.isEdit = true;
    this.editAssetId = asset.id;
    this.assetForm.patchValue(asset);
  }

  onDelete(id: number): void {
    this.assetService.deleteAsset(id).subscribe(() => this.loadAssets());
  }

  resetForm(): void {
    this.isEdit = false;
    this.editAssetId = null;
  
    // Reset only the specified form controls
    this.assetForm.reset({
      branch_id: '',
      branch_name: '',
      group_id: '',
      desktop_name: '',
      configuration: '',
      tag_name: '',
      status: '',
      asset_get_by: '',
      serial_number: '',
      sub_branch: '',
      OS: '',
      RAM: '',
      Storage: ''
    });
  }
  
  onBranchChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const selectedBranchId = parseInt(selectElement.value, 10);
    const selectedBranch = this.branches.find(branch => branch.branch_id === selectedBranchId);
    if (selectedBranch) {
      this.assetForm.patchValue({
        branch_name: selectedBranch.branch_name
      });

      if (selectedBranch.branch_name === 'Head Office') {
        this.subBranchOptions = [
          'Select Division',
          'Chairman Sir & MD & CEO Office',
          'Agent Banking',
          'AML & CFT',
          'ICT',
          'ADC',
          'Card Division',
          'Human Resource',
          'FAD',
          'Bach',
          'Operation'
        ];
      } else {
        this.subBranchOptions = ['N/A'];

      }

      this.assetForm.patchValue({
        sub_branch: this.subBranchOptions[0]
      });
    }
  }

  onGroupChange(event: any): void {
    const selectedGroupId = +event.target.value;
    
    const selectedGroup = this.groups.find(group => +group.group_id === selectedGroupId);
    
    if (selectedGroup && selectedGroup.group_name === 'CPU') {
      this.isCpuGroup = true;
      this.isLaptopGroup = false;
      this.deviceOptions = ['Dell', 'HP', 'Lenovo'];
      this.configOptions = ['Core i3', 'Core i5', 'Core i7'];
      this.osOptions = ['Windows 7', 'Windows 10' , 'Windows 11' , 'Windows Server'];
      this.ramOptions = ['4 GB' , '8 GB' , '16 GB'];
      this.storageOptions = ['1 TB' , '500 GB' , '256 GB']
      
    }
    else if (selectedGroup && selectedGroup.group_name === 'Laptop') {
      this.isLaptopGroup = true;
      this.isCpuGroup = false;
      this.isOfflineUpsGroup = false;
      this.isIpPhoneSetGroup = false;
      this.isPrinterBranchGroup = false;
      this.isPrinterBrtaGroup = false;
      this.isScannerrGroup = false;
      this.isMonitorGroup = false;
      this.deviceOptions = ['Dell', 'HP', 'Lenovo','Accer'];
      this.configOptions = ['Core i3', 'Core i5', 'Core i7'];
      this.osOptions = ['Windows 10', 'Windows 11'];
      this.ramOptions = ['4 GB' , '8 GB' , '16 GB'];
      this.storageOptions = ['1 TB' , '500 GB' , '256 GB'];
    }
    else if (selectedGroup && selectedGroup.group_name === 'Monitor') {
      this.isMonitorGroup = true
      this.isLaptopGroup = false;
      this.isCpuGroup = false;
      this.isOfflineUpsGroup = false;
      this.isIpPhoneSetGroup = false;
      this.isPrinterBranchGroup = false;
      this.isPrinterBrtaGroup = false;
      this.isScannerrGroup = false;
      this.deviceOptions = ['Dell', 'HP'];
      this.configOptions = ['19.5 inch', '21 inch'];
      this.osOptions = ['N/A'];
      this.ramOptions = ['N/A'];
      this.storageOptions = ['N/A'];
    }
    else if (selectedGroup && selectedGroup.group_name === 'Scanner (e-doc)') {
      this.isScannerrGroup = true;
      this.isMonitorGroup = false;
      this.isLaptopGroup = false;
      this.isCpuGroup = false;
      this.isOfflineUpsGroup = false;
      this.isIpPhoneSetGroup = false;
      this.isPrinterBranchGroup = false;
      this.isPrinterBrtaGroup = false;
      this.deviceOptions = ['Avision', 'Cannon'];
      this.configOptions = ['AV332U'];
      this.osOptions = ['N/A'];
      this.ramOptions = ['N/A'];
      this.storageOptions = ['N/A'];
    }
    else if (selectedGroup && selectedGroup.group_name === 'Printer (BRTA)') {
      this.isPrinterBrtaGroup = true;
      this.isScannerrGroup = false;
      this.isMonitorGroup = false;
      this.isLaptopGroup = false;
      this.isCpuGroup = false;
      this.isOfflineUpsGroup = false;
      this.isIpPhoneSetGroup = false;
      this.isPrinterBranchGroup = false;
      this.deviceOptions = ['Epson', 'Cannon'];
      this.configOptions = ['LQ310'];
      this.osOptions = ['N/A'];
      this.ramOptions = ['N/A'];
      this.storageOptions = ['N/A'];
    }
    else if (selectedGroup && selectedGroup.group_name === 'Printer (Branch)') {
      this.isPrinterBranchGroup = true;
      this.isPrinterBrtaGroup = false;
      this.isScannerrGroup = false;
      this.isMonitorGroup = false;
      this.isLaptopGroup = false;
      this.isCpuGroup = false;
      this.deviceOptions = ['RICOH', 'HP'];
      this.configOptions = ['M-2700','LaserJetPro-400','LaserJetPro-M402DN'];
      this.osOptions = ['N/A'];
      this.ramOptions = ['N/A'];
      this.storageOptions = ['N/A'];
    }
    else if (selectedGroup && selectedGroup.group_name === 'Ip Phone (Set)') {
      this.isIpPhoneSetGroup = true
      this.isPrinterBranchGroup = false;
      this.isPrinterBrtaGroup = false;
      this.isScannerrGroup = false;
      this.isMonitorGroup = false;
      this.isLaptopGroup = false;
      this.isCpuGroup = false;
      this.isOfflineUpsGroup = false;
     
      this.deviceOptions = ['AVAYA', 'Panasonic'];
      this.configOptions = ['J139','1603 L','POTS'];
      this.osOptions = ['N/A'];
      this.ramOptions = ['N/A'];
      this.storageOptions = ['N/A'];
    }
    else if (selectedGroup && selectedGroup.group_name === 'Offline UPS') {
      this.isOfflineUpsGroup = true;
      this.isIpPhoneSetGroup = false;
      this.isPrinterBranchGroup = false;
      this.isPrinterBrtaGroup = false;
      this.isScannerrGroup = false;
      this.isMonitorGroup = false;
      this.isLaptopGroup = false;
      this.isCpuGroup = false;
      this.isIpPhoneSetGroup = false;
      this.deviceOptions = ['Apollo', 'Power Guard', 'Prolink'];
      this.configOptions = ['650 VA'];
      this.osOptions = ['N/A'];
      this.ramOptions = ['N/A'];
      this.storageOptions = ['N/A'];
    } 
    else {

      this.assetForm.patchValue({
        desktop_name: '',
        configuration: '',
        OS: 'N/A',
        RAM: 'N/A',
        Storage: 'N/A',
      });
    }



    
  }


  loadBranches(): void {
    this.branchService.getBranches().subscribe((data: Branch[]) => {
      // Check user type, you may need to adjust this depending on how you manage user information
      const userType = localStorage.getItem('user_type');

      if (userType === 'superadmin') {
        // Superadmin sees all branches
        this.branches = data;
      } else {
        // Filter branches based on the branch_id stored in localStorage
        const branchId = localStorage.getItem('branch_id');
        if (branchId) {
          const branchIdNum = parseInt(branchId, 10);
          this.branches = data.filter(branch => branch.branch_id === branchIdNum);
        } else {
          this.branches = []; // Or any default behavior if no branch ID is set
        }
      }
    });
  }


}
