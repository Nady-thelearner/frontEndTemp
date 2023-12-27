import { Component, OnInit } from '@angular/core';
import { UserService } from '../auth/user.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { productService } from '../store/add-product/product.service';

@Component({
  selector: 'app-address',
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.css'],
})
export class AddressComponent implements OnInit {
  constructor(private userSF: UserService, private productSF: productService) {}
  addresss: string[];
  addressSelected: string;
  enterAdd: boolean = false;
  form: FormGroup;
  productDetails: any[];
  productAdded: boolean = false;
  ngOnInit(): void {
    this.productDetails = this.productSF.getTempData();
    console.log('product Details', this.productDetails);
    this.userSF.getUserAddress().subscribe((res) => {
      this.addresss = res.data;
      console.log('address....', res);
    });

    this.form = new FormGroup({
      address: new FormControl(null, { validators: [Validators.required] }),
    });
  }

  onSelectionChange(event: any): void {
    function generateUniqueRefNumber() {
      const currentDate = new Date();

      const formattedDate = currentDate
        .toISOString()
        .replace(/[-T:]/g, '')
        .slice(0, 14);

      const randomPart = Math.floor(Math.random() * 9000) + 1000;

      const uniqueRefNumber = formattedDate + randomPart;

      return uniqueRefNumber;
    }
    const refNO = generateUniqueRefNumber();
    this.addressSelected = event.options[0]._value;
    console.log('Selected Address:', this.addressSelected);
    this.productDetails[0].address = this.addressSelected;
    this.productDetails[0].uniqueRef = refNO;
    console.log('product Details', this.productDetails);
    this.enterAdd = false;
  }
  addAddress(address: string) {
    console.log('address', address);
    this.userSF.addUserAddress(address).subscribe((res) => {
      console.log(res.success);
      if (res.success === true) {
        this.userSF.getUserAddress().subscribe((res) => {
          this.addresss = res.data;
          console.log('address....', res);
        });
      }
    });
  }

  formVisible() {
    this.enterAdd = !this.enterAdd;
  }
  onSubmit() {
    if (this.form.invalid) {
      return;
    }

    // console.log(this.form.value.address, 'address');
    this.addAddress(this.form.value.address);
    this.formVisible();
    this.form.reset();
  }

  placeOrder() {
    this.productSF.addproductDetails(this.productDetails).subscribe((res) => {
      if (res.success == true) {
        this.productAdded = true;
        this.addressSelected = null;
      }
      console.log(res);
    });
  }
}
