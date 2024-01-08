import { Component, OnInit } from '@angular/core';
import { productService } from '../add-product/product.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-view-orders',
  templateUrl: './view-orders.component.html',
  styleUrls: ['./view-orders.component.css'],
})
export class ViewOrdersComponent implements OnInit {
  constructor(private productSF: productService, private route: Router) {}
  orderNumber: { [key: string]: string } = {};
  uniqueORder: any;
  productDetails: any[] = [];
  compProdDet: any[] = [];

  ngOnInit(): void {
    this.getOrders();
  }
  getOrders() {
    this.productSF.getOderDetails().subscribe((res) => {
      this.orderNumber = res.data;
      console.log('vendor specific orders', res);
    });
  }
  getObjectKeys(obj: any): string[] {
    return Object.keys(obj || {});
  }

  getOrderDet(uniqueID) {
    for (const key in this.orderNumber) {
      if (this.orderNumber.hasOwnProperty(key)) {
        if (key === uniqueID) {
          this.uniqueORder = this.orderNumber[key];
        }
      }
    }
    // console.log('uniqueOrder', this.uniqueORder);
    this.productDetails = this.uniqueORder.map((item) => ({
      product_id: item.product_id,
      quantity: item.quantity,
    }));
    console.log('productDetails', this.productDetails);

    for (let i = 0; i < this.productDetails.length; i++) {
      const element = this.productDetails[i].product_id;
      this.productSF.getOneProduct(element).subscribe((res) => {
        // this.productDetails.push(res.data[0]);
        console.log('res of produc', res.data[0]);
        this.compProdDet[i] = res.data[0];
        // const noOfProduct = this.groupedArray[i].length;
        // this.productPrice =
        //   this.productPrice +
        //   this.calcPP(+res.data[0].price, +res.data[0].discount, noOfProduct);
      });
      console.log('res of produc22222222', this.compProdDet);
    }
  }
}
