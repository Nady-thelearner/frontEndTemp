import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { UserService } from 'src/app/auth/user.service';
import { productService } from 'src/app/store/add-product/product.service';
import { ThemePalette } from '@angular/material/core';
import { ProgressBarMode } from '@angular/material/progress-bar';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
})
export class CartComponent implements OnInit, OnDestroy {
  longText = `test `;
  groupedArray: any[];
  productIds: any[];
  productDetails: any[] = [];
  productPrice: number = 0;
  color: ThemePalette = 'accent';
  mode: ProgressBarMode = 'determinate';
  value = 25;
  bufferValue = 0;
  cartItemCount: number = 0;
  vendor_id: string;
  constructor(
    private productSF: productService,
    private userSF: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.vendor_id = this.productSF.getVendorID();
    console.log('cart', this.cartItemCount);
    this.userSF.cartItem$.subscribe((count) => {
      this.cartItemCount = count;
      this.cdr.detectChanges();
    });
    this.productIds = this.productSF.getCartDetails();

    function groupDistinctValues(inputArray: string[]): string[][] {
      const distinctValues = Array.from(new Set(inputArray));
      return distinctValues.map((value) =>
        inputArray.filter((item) => item === value)
      );
    }
    this.groupedArray = groupDistinctValues(this.productIds);
    console.log('grouped array', this.groupedArray);
    var price = 0;
    for (let i = 0; i < this.groupedArray.length; i++) {
      const product_id = this.groupedArray[i][0];
      this.productSF.getOneProduct(product_id).subscribe((res) => {
        this.productDetails.push(res.data[0]);

        const noOfProduct = this.groupedArray[i].length;
        this.productPrice =
          this.productPrice +
          this.calcPP(+res.data[0].price, +res.data[0].discount, noOfProduct);
      });
    }
  }

  ngOnDestroy(): void {
    var productDetails = [];
    const totalProduct = this.groupedArray.length;
    for (let index = 0; index < totalProduct; index++) {
      const vendor_id = this.productDetails[index].vendor_id;
      const store_id = this.productDetails[index].store_id;
      const productLen = this.groupedArray[index].length;
      for (let j = 0; j < productLen; j++) {
        var productId = this.groupedArray[index][j];
        break;
      }

      productDetails.push({
        product_id: productId,
        quantity: productLen,
        vendor_id: vendor_id,
        store_id: store_id,
      });
      var comp = [];
      const user_id = this.userSF.getUserID().userId;
      comp.push({
        productDetails: productDetails,
        address: null,
        uniqueRef: null,
        user_id: user_id,
      });
    }
    console.log('triggereed destroy', comp);
    this.productSF.temporaryDataStore(comp);
  }

  private calcPP(price: number, discount: number, noOfProduct: number) {
    return (price - price * (discount / 100)) * noOfProduct;
  }

  onDelete(i) {
    this.userSF.removeFromCart();
    const arr0 = this.groupedArray[i][0];
    this.productSF.removeFromCart(arr0);
    let indexToRemove = this.groupedArray[i].findIndex((item) => item === arr0);
    if (indexToRemove !== -1) {
      this.groupedArray[i].splice(indexToRemove, 1);
    }
  }

  onAddtoCart(i) {
    const arr0 = this.groupedArray[i][0];
    this.groupedArray[i].push(arr0);
    this.productSF.addCartDetails(arr0);
  }

  addProductPrice(price: number, discount: number) {
    var discountedPrice = price - price * (discount / 100);
    this.productPrice += discountedPrice;
    this.changeInProductPrice(this.productPrice);
  }

  subProductPrice(price: number, discount: number) {
    var discountedPrice = price - price * (discount / 100);
    this.productPrice -= discountedPrice;
    this.changeInProductPrice(this.productPrice);
  }

  private changeInProductPrice(productPrice: number) {
    if (productPrice == 0) {
      this.value = 0;
    } else {
      this.value = 50;
    }
  }
}
