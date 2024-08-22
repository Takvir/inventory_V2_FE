import { Component, OnInit } from '@angular/core';
import { TagAssetService } from 'src/app/services/tag-asset/tag-asset.service';
import { BranchService } from 'src/app/services/branch/branch.service';
import { GroupService } from 'src/app/services/group/group.service';

interface Asset {
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
  employee_number: number; // Add this field
}

export interface Group2 {
  group_id: number;
  group_name: string;
  stock_in_hand: number;
  user_group: string;
}

interface AssetCount {
  [branchName: string]: {
    [groupName: string]: number;
    employee_count: number; // Add this field
  };
}

@Component({
  selector: 'app-all-report',
  templateUrl: './all-report.component.html',
  styleUrls: ['./all-report.component.css']
})
export class AllReportComponent implements OnInit {
  assets: Asset[] = [];
  branches: Branch[] = [];
  groups: Group2[] = [];
  assetCounts: AssetCount = {};
  rowTotals: { [branchName: string]: number } = {};
  columnTotals: { [groupName: string]: number } = {};
  grandTotal: number = 0;
  searchTerm: string = '';
  filteredBranches: Branch[] = [];

  constructor(
    private assetService: TagAssetService,
    private branchService: BranchService,
    private groupService: GroupService
  ) { }

  ngOnInit(): void {
    this.loadBranches();
    this.loadGroups();
  }

  loadBranches(): void {
    this.branchService.getBranches().subscribe((data: Branch[]) => {
      this.branches = data;
      this.filteredBranches = this.branches;
      this.loadAssets();
    });
  }

  loadGroups(): void {
    this.groupService.getGroups2().subscribe((data: Group2[]) => {
      this.groups = data;
    });
  }

  loadAssets(): void {
    this.assetService.getAssets().subscribe((assets: Asset[]) => {
      this.assets = assets;
      this.calculateAssetCounts();
    });
  }

  calculateAssetCounts(): void {
    console.log('Starting asset count calculation');
    
    this.assetCounts = {};
    this.rowTotals = {};
    this.columnTotals = {};
    this.grandTotal = 0;
  
    // Initialize assetCounts with employee numbers and empty counts for each group
    this.branches.forEach(branch => {
      this.assetCounts[branch.branch_name] = {
        employee_count: branch.employee_number,
        ...this.groups.reduce((acc, group) => {
          acc[group.group_name] = 0; // Initialize count to 0 for each group
          return acc;
        }, {} as { [key: string]: number })
      };
    });
  
    console.log('Initialized assetCounts:', this.assetCounts);
  
    // Calculate the asset counts
    this.assets.forEach(asset => {
      const branchName = this.branches.find(branch => branch.branch_id === asset.branch_id)?.branch_name;
      const groupName = this.groups.find(group => group.group_id.toString() === asset.group_id.toString())?.group_name;
  
      console.log(`Processing asset ${asset.asset_id}: Branch Name = ${branchName}, Group Name = ${groupName}`);
  
      if (branchName && groupName) {
        if (this.assetCounts[branchName]) {
          this.assetCounts[branchName][groupName] = (this.assetCounts[branchName][groupName] || 0) + 1;
          this.rowTotals[branchName] = (this.rowTotals[branchName] || 0) + 1;
        }
  
        this.columnTotals[groupName] = (this.columnTotals[groupName] || 0) + 1;
        this.grandTotal++;
      }
    });
  
    console.log('Final assetCounts:', this.assetCounts);
    console.log('Final rowTotals:', this.rowTotals);
    console.log('Final columnTotals:', this.columnTotals);
    console.log('Grand Total:', this.grandTotal);
  }
  
  
  
  

  filterData(): void {
    this.filteredBranches = this.branches.filter(branch =>
      branch.branch_name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  downloadTableData(): void {
    const csvData = this.convertToCSV();
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'assets_report.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  convertToCSV(): string {
    // Create CSV header
    const header = ['Branch Name', 'Employee Number', ...this.groups.map(group => group.group_name), 'Total'].join(',') + '\n';

    // Create CSV rows
    const rows = this.filteredBranches.map(branch => [
      branch.branch_name,
      branch.employee_number,
      ...this.groups.map(group => this.assetCounts[branch.branch_name][group.group_name] || 0),
      this.rowTotals[branch.branch_name] || 0
    ].join(',')).join('\n');

    // Add totals row
    const totalsRow = [
      'Total',
      '',
      ...this.groups.map(group => this.columnTotals[group.group_name] || 0),
      this.grandTotal
    ].join(',');

    return header + rows + '\n' + totalsRow;
  }
}
