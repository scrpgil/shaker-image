import { Component, Element, State, Listen, h } from "@stencil/core";

@Component({
  tag: "app-home",
  styleUrl: "app-home.css"
})
export class AppHome {
  @State() width: number = 200;
  @State() height: number = 150;
  @Element() el: HTMLElement;

  moved: boolean = false;
  move_start_x: number = 0;
  move_start_y: number = 0;

  mask_x: number = 60;
  mask_y: number = 60;
  canvasTop: number = 0;
  intervalId: any;
  @State() isShake: boolean = false;
  isY: boolean = false;

  offsetX: number = 0;
  offsetY: number = 0;
  offsetZ: number = 0;
  offsetDelay: number = 0;
  count: number = 0;

  widthSizeChange(el) {
    this.width = el.detail.value;
  }

  heightSizeChange(el) {
    this.height = el.detail.value;
  }

  offsetXChange(el) {
    this.offsetX = el.detail.value;
  }

  offsetYChange(el) {
    this.offsetY = el.detail.value;
  }

  offsetZChange(el) {
    this.offsetZ = el.detail.value;
  }

  offsetDelayChange(el) {
    this.offsetDelay = el.detail.value;
  }

  @Listen("mousemove")
  handleScrollMouseMove(ev) {
    this.move(ev.clientX, ev.clientY);
  }

  @Listen("touchmove")
  handleScrollTouchMove(ev) {
    this.move(ev.touches[0].clientX, ev.touches[0].clientY);
  }

  @Listen("mouseup")
  handleScrollMouseEnd() {
    this.moveEnd();
  }

  @Listen("touchend")
  handleScrollTouchEnd() {
    this.moveEnd();
  }

  async moveEnd() {
    if (this.moved) {
      this.moved = false;
    }
  }

  async moveStartMouse(ev) {
    this.moveStart(ev.clientX, ev.clientY);
  }
  async moveStartTouch(ev) {
    this.moveStart(ev.touches[0].clientX, ev.touches[0].clientY);
  }
  async moveStart(x: number, y: number) {
    if (!this.moved) {
      let elem_x = parseInt(
        document.getElementById("mask").style.left.replace("px", "")
      );
      if (!elem_x) {
        elem_x = 0;
      }
      let elem_y = parseInt(
        document.getElementById("mask").style.top.replace("px", "")
      );
      if (!elem_y) {
        elem_y = 0;
      }
      this.move_start_x = x - elem_x;
      this.move_start_y = y - elem_y;

      this.moved = true;
    }
  }

  async move(x: number, y: number) {
    if (this.moved) {
      this.mask_x = x - this.move_start_x;
      this.mask_y = y - this.move_start_y;
      document.getElementById("mask").style.left = this.mask_x + "px";
      document.getElementById("mask").style.top = this.mask_y + "px";
    }
  }

  drawImage(e: any) {
    var preview: any = document.getElementById("preview");
    var reader = new FileReader();
    reader.onload = e => {
      preview.src = e.target.result;
    };
    reader.readAsDataURL(e.target.files[0]);
  }

  merge() {
    var c: any = document.getElementById("merge");
    var ctx = c.getContext("2d");
    var preview: any = document.getElementById("preview");
    var mask: any = document.getElementById("mask-image");
    c.width = preview.width;
    c.height = preview.height;
    ctx.drawImage(preview, 0, 0, preview.width, preview.height);
    ctx.drawImage(mask, this.mask_x, this.mask_y, mask.width, mask.height);
  }

  imgShakeToggle(): void {
    this.count++;
    if (this.count < this.offsetDelay / 10) {
      return;
    }
    this.count = 0;
    var canvas: any = document.getElementById("merge");
    if (!this.canvasTop) {
      this.canvasTop = 0;
    }
    if (this.isY) {
      this.canvasTop = this.canvasTop + 1;
    } else {
      this.canvasTop = this.canvasTop - 1;
    }
    if (0 <= this.canvasTop) {
      let scale = 1;
      if (this.offsetZ != 0) {
        scale = 1 + this.offsetZ / 1000;
      }
      let x = 0;
      if (this.offsetX != 0) {
        x = 1 + this.offsetX / 10;
        x = (x / 6) * this.canvasTop;
      }
      let y = 0;
      if (this.offsetY != 0) {
        y = 1 + this.offsetY / 10;
        y = (y / 6) * this.canvasTop;
      }
      canvas.style.transform =
        "translateX(-" + x + "px) translateY(" + y + "px) scale(" + scale + ")";
    } else if (0 > this.canvasTop) {
      let scale = 1;
      if (this.offsetZ != 0) {
        scale = 1 - this.offsetZ / 1000;
      }
      let x = 0;
      if (this.offsetX != 0) {
        x = 1 + this.offsetX / 10;
        x = (x / 6) * this.canvasTop;
      }
      let y = 0;
      if (this.offsetY != 0) {
        y = 1 + this.offsetY / 10;
        y = (y / 6) * this.canvasTop;
      }
      canvas.style.transform =
        "translateX(" + x + "px) translateY(-" + y + "px) scale(" + scale + ")";
    }

    if (6 <= this.canvasTop) {
      this.isY = false;
    } else if (-6 >= this.canvasTop) {
      this.isY = true;
    }
  }
  imgShake() {
    if (!this.intervalId) {
      this.intervalId = setInterval(this.imgShakeToggle.bind(this), 1);
      this.isShake = true;
    } else {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.isShake = false;
      this.count = 0;
    }
  }
  saveCanvas(saveType) {
    var imageType = "image/png";
    var fileName = "shaker_" + this.getDateTime() + ".png";
    if (saveType === "jpeg") {
      imageType = "image/jpeg";
      fileName = "sample.jpg";
    }
    var canvas: any = document.getElementById("merge");
    // base64エンコードされたデータを取得 「data:image/png;base64,iVBORw0k～」
    var base64 = canvas.toDataURL(imageType);
    // base64データをblobに変換
    var blob = this.Base64toBlob(base64);
    // blobデータをa要素を使ってダウンロード
    this.saveBlob(blob, fileName);
  }

  getDateTime() {
    let today = new Date();
    return (
      today.getFullYear() +
      "" +
      ("0" + (today.getMonth() + 1)).slice(-2) +
      "" +
      ("0" + today.getDate()).slice(-2) +
      "" +
      ("0" + today.getHours()).slice(-2) +
      "" +
      ("0" + today.getMinutes()).slice(-2) +
      "" +
      ("0" + today.getSeconds()).slice(-2)
    );
  }

  // Base64データをBlobデータに変換
  Base64toBlob(base64) {
    // カンマで分割して以下のようにデータを分ける
    // tmp[0] : データ形式（data:image/png;base64）
    // tmp[1] : base64データ（iVBORw0k～）
    var tmp = base64.split(",");
    // base64データの文字列をデコード
    var data = atob(tmp[1]);
    // tmp[0]の文字列（data:image/png;base64）からコンテンツタイプ（image/png）部分を取得
    var mime = tmp[0].split(":")[1].split(";")[0];
    //  1文字ごとにUTF-16コードを表す 0から65535 の整数を取得
    var buf = new Uint8Array(data.length);
    for (var i = 0; i < data.length; i++) {
      buf[i] = data.charCodeAt(i);
    }
    // blobデータを作成
    var blob = new Blob([buf], { type: mime });
    return blob;
  }

  // 画像のダウンロード
  saveBlob(blob, fileName) {
    var url = window.URL || window.webkitURL;
    // ダウンロード用のURL作成
    var dataUrl = url.createObjectURL(blob);
    // イベント作成
    var event = document.createEvent("MouseEvents");
    event.initMouseEvent(
      "click",
      true,
      false,
      window,
      0,
      0,
      0,
      0,
      0,
      false,
      false,
      false,
      false,
      0,
      null
    );
    // a要素を作成
    var a: any = document.createElementNS("http://www.w3.org/1999/xhtml", "a");
    // ダウンロード用のURLセット
    a.href = dataUrl;
    // ファイル名セット
    a.download = fileName;
    // イベントの発火
    a.dispatchEvent(event);
  }

  render() {
    return [
      <ion-header>
        <ion-toolbar color="primary">
          <ion-title>画像揺らし機</ion-title>
        </ion-toolbar>
      </ion-header>,

      <ion-content class="ion-padding">
        <div class="preview-wrapper">
          <img id="preview" src="assets/sample.jpg" />
          <div
            class="mask-wrapper"
            id="mask"
            onMouseDown={ev => this.moveStartMouse(ev)}
            onTouchStart={ev => this.moveStartTouch(ev)}
          >
            <img
              width={this.width}
              height={this.height}
              class="mask"
              id="mask-image"
              src="assets/mask.png"
            />
          </div>
        </div>

        <div>
          <label>
            画像を読込む:
            <input type="file" onChange={event => this.drawImage(event)} />
          </label>
        </div>
        <div class="controller">
          <div class="width-size-wrapper">
            <div class="title">横幅</div>
            <ion-range
              min={100}
              max={480}
              value={this.width}
              step={1}
              pin={true}
              color="medium"
              onIonChange={e => this.widthSizeChange(e)}
            >
              <ion-label slot="start">100</ion-label>
              <ion-label slot="end">480</ion-label>
            </ion-range>
          </div>
          <div class="height-size-wrapper">
            <div class="title">縦幅</div>
            <ion-range
              min={100}
              max={900}
              value={this.height}
              step={1}
              pin={true}
              color="medium"
              onIonChange={e => this.heightSizeChange(e)}
            >
              <ion-label slot="start">100</ion-label>
              <ion-label slot="end">900</ion-label>
            </ion-range>
          </div>
        </div>
        <ion-button onClick={() => this.merge()} expand="block">
          画像生成
        </ion-button>
        <div class="merge-wrapper">
          <div id="canvas-container">
            <canvas id="merge" />
          </div>
          {(() => {
            if (this.isShake) {
              return (
                <div class="config">
                  <div class="width-size-wrapper">
                    <div class="title">X</div>
                    <ion-range
                      min={0}
                      max={100}
                      value={this.offsetX}
                      step={1}
                      pin={true}
                      color="medium"
                      onIonChange={e => this.offsetXChange(e)}
                    >
                      <ion-label slot="start">0</ion-label>
                      <ion-label slot="end">100</ion-label>
                    </ion-range>
                  </div>
                  <div class="width-size-wrapper">
                    <div class="title">Y</div>
                    <ion-range
                      min={0}
                      max={100}
                      value={this.offsetY}
                      step={1}
                      pin={true}
                      color="medium"
                      onIonChange={e => this.offsetYChange(e)}
                    >
                      <ion-label slot="start">0</ion-label>
                      <ion-label slot="end">100</ion-label>
                    </ion-range>
                  </div>
                  <div class="width-size-wrapper">
                    <div class="title">Scale</div>
                    <ion-range
                      min={0}
                      max={100}
                      value={this.offsetZ}
                      step={1}
                      pin={true}
                      color="medium"
                      onIonChange={e => this.offsetZChange(e)}
                    >
                      <ion-label slot="start">0</ion-label>
                      <ion-label slot="end">100</ion-label>
                    </ion-range>
                  </div>
                  <div class="width-size-wrapper">
                    <div class="title">Delay</div>
                    <ion-range
                      min={0}
                      max={100}
                      value={this.offsetDelay}
                      step={1}
                      pin={true}
                      color="medium"
                      onIonChange={e => this.offsetDelayChange(e)}
                    >
                      <ion-label slot="start">0</ion-label>
                      <ion-label slot="end">100</ion-label>
                    </ion-range>
                  </div>
                </div>
              );
            }
          })()}
          <ion-button onClick={() => this.imgShake()} expand="block">
            揺らす
          </ion-button>
          <ion-button onClick={() => this.saveCanvas("png")} expand="block">
            ダウンロード
          </ion-button>
        </div>
      </ion-content>
    ];
  }
}
