Popzy.elements = [];

function Popzy(options = {}) {
  this.opt = Object.assign(
    {
      destroyOnClose: true,
      closeMethods: ["button", "overlay", "escape"],
      footer: false,
    },
    options,
  );

  this._template = document.querySelector(`#${this.opt.templateId}`);

  this._allowButtonClose = this.opt.closeMethods.includes("button");
  this._allowOverlayClose = this.opt.closeMethods.includes("overlay");
  this._allowEscapeClose = this.opt.closeMethods.includes("escape");

  Popzy.prototype._build = function () {
    this._templateContent = this._template.content.cloneNode(true);
    this._backdrop = document.createElement("div");
    this._backdrop.className = "popzy__backdrop";

    this._container = document.createElement("div");
    this._container.className = "popzy__container";

    if (this._allowButtonClose) {
      this._modalCloseBtn = this._createButton("&times;", "popzy__close", () =>
        this.close(),
      );
    }

    this._modalContent = document.createElement("div");
    this._modalContent.className = "popzy__content";

    this._container.append(this._modalContent, this._modalCloseBtn);
    this._backdrop.append(this._container);
    document.body.append(this._backdrop);

    this._modalContent.append(this._templateContent);

    setTimeout(() => {
      this._backdrop.classList.add("popzy--show");
    }, 0);

    this._handleEscapeKey = this._handleEscapeKey.bind(this);

    if (this.opt.footer) {
      this._modalFooter = document.createElement("div");
      this._modalFooter.className = "popzy__footer";

      this._renderFooterContent();
      this.renderFooterButton();

      this._container.append(this._modalFooter);
    }
  };

  Popzy.prototype.open = function () {
    Popzy.elements.push(this);
    if (!this._backdrop) {
      this._build();
    } else {
      this._backdrop.classList.add("popzy--show");
    }

    if (this._allowOverlayClose) {
      if (this._backdrop) {
        this._backdrop.onclick = (e) => {
          if (e.target === this._backdrop) {
            this.close();
          }
        };
      }
    }

    if (this._allowEscapeClose) {
      document.addEventListener("keydown", this._handleEscapeKey);
    }
    document.body.classList.add("popzy--no-scroll");
    document.body.style.paddingRight = this._getScrollbarWidth() + "px";

    if (typeof onOpen === "function") onOpen();

    return this._backdrop;
  };

  Popzy.prototype.close = function (destroy = this.opt.destroyOnClose) {
    console.log(this);
    // Modal.elements.pop();
    const index = Popzy.elements.indexOf(this);
    if (index > -1) {
      Popzy.elements.splice(index, 1);
    }
    this._backdrop.classList.remove("popzy--show");
    if (destroy && this._backdrop) {
      this._onTransitionEnd(() => {
        this._backdrop.remove();
        this._backdrop = null;
      });
    }
    document.body.classList.remove("popzy--no-scroll");
    document.body.style.paddingRight = "";

    if (this._allowEscapeClose) {
      document.removeEventListener("keydown", this._handleEscapeKey);
    }
    console.log("Closing:", this._template.id);
  };
  //end close

  Popzy.prototype.setFooterContent = function (html) {
    this._footerContent = html;
    this._renderFooterContent();
  };

  this._modalButtons = [];
  Popzy.prototype.addFooterButton = function (title, cssClass, callback) {
    const button = this._createButton(title, cssClass, callback);
    this._modalButtons.push(button);
    return this._modalButtons;
  };

  Popzy.prototype._createButton = function (title, cssClass, callback) {
    const button = document.createElement("button");
    button.className = cssClass;
    button.innerHTML = title;
    button.onclick = callback;
    return button;
  };

  Popzy.prototype.renderFooterButton = function () {
    this._modalButtons.forEach((btn) => {
      this._modalFooter.append(btn);
    });
  };

  Popzy.prototype._renderFooterContent = function () {
    if (this._modalFooter && this._footerContent) {
      this._modalFooter.innerHTML = this._footerContent;
    }
  };

  Popzy.prototype._handleEscapeKey = function (e) {
    const lastModal = Popzy.elements[Popzy.elements.length - 1];
    if (e.key === "Escape" && lastModal === this) {
      this.close();
    }
  };

  Popzy.prototype._onTransitionEnd = function (callback) {
    this._handler = (e) => {
      if (e.propertyName !== "transform") return;
      if (typeof callback === "function") {
        callback && callback();
      }
      document.removeEventListener("transitionend", this._handler);
    };
    document.addEventListener("transitionend", this._handler);
  };

  Popzy.prototype._getScrollbarWidth = function () {
    if (this._scrollbarWidth) return this._scrollbarWidth;
    const div = document.createElement("div");
    Object.assign(div.style, {
      overflow: "scroll",
      position: "absolute",
      top: "-9999px",
    });
    document.body.appendChild(div);
    this._scrollbarWidth = div.offsetWidth - div.clientWidth;
    document.body.removeChild(div);
    return this._scrollbarWidth;
  };
  this._getScrollbarWidth();
}
