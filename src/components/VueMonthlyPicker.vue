<template>
  <div class="vue-monthly-picker">
    <div class="month-picker-wrapper" :class="{ 'active visible': showMenu }">
      <div
        class="month-year-label picker"
        type="text"
        autocomplete="off"
        tabindex="0"
        role="button"
        :aria-expanded="showMenu ? 'true' : 'false'"
        :aria-disabled="disabled ? 'true' : 'false'"
        @click="openMenu"
        @keydown.enter.prevent="openMenu"
        @keydown.space.prevent="openMenu"
      >
        <div
          class="month-year-display"
          :disabled="disabled"
          :class="[inputClass, { placeholder: !modelValue }]"
        >
          <div class="display-text" :class="'display-text-' + alignment" :style="{ textAlign: alignment }">
            {{ displayText }}
          </div>
          <span class="vmp-input-append" @click.stop.prevent="clearSelect" v-if="clearOption && modelValue">
            <i class="vmp-clear-icon" />
          </span>
        </div>
      </div>
      <div class="text"></div>
      <div class="date-popover" :class="menuClass" :style="menuStyle" tabindex="-1">
        <div class="picker" style="text-align: center">
          <div class="flexbox">
            <span class="prev" @click="prevYear" :class="{ deactive: !canBack }"></span>
            <div>{{ year }}</div>
            <span class="next" @click="nextYear" :class="{ deactive: !canNext }"></span>
          </div>
          <div class="flexbox monthItem">
            <template v-for="(month, idx) in monthLabels" :key="idx">
              <div
                v-if="isActive(idx)"
                class="item active"
                :class="{ selected: isCurrentSelected(year, idx) }"
                :style="{ backgroundColor: getBackgroundColor(year, idx) }"
                @click="selectMonth(idx)"
              >{{ month }}</div>
              <div v-else class="item deactive" :class="{ selected: isCurrentSelected(year, idx) }">
                {{ month }}
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment'

export default {
  name: 'VueMonthlyPicker',
  props: {
    modelValue: { default: null },
    disabled: { type: Boolean, default: false },
    inputClass: { default: 'input' },
    placeHolder: { type: String, default: '' },
    alignment: {
      type: String,
      default: 'left',
      validator: value => ['left', 'right', 'center'].includes(value),
    },
    selectedBackgroundColor: { type: String, default: '#007bff' },
    monthLabels: {
      type: Array,
      default: () => ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    },
    min: { default: null },
    max: { default: null },
    dateFormat: { type: String, default: 'YYYY/MM' },
    clearOption: { type: Boolean, default: true },
  },
  emits: ['update:modelValue', 'selected'],
  data() {
    return {
      showMenu: false,
      year: moment().format('YYYY'),
      month: moment().format('MM'),
      outsideClickHandler: null,
    }
  },
  mounted() {
    this.outsideClickHandler = event => {
      if (this.$el && !this.$el.contains(event.target)) this.closeMenu()
    }
    document.addEventListener('click', this.outsideClickHandler, false)
    this.setValue(this.modelValue)
  },
  unmounted() {
    document.removeEventListener('click', this.outsideClickHandler, false)
  },
  watch: {
    modelValue(value) {
      this.setValue(value)
    },
  },
  computed: {
    menuClass() {
      return { visible: this.showMenu, hidden: !this.showMenu }
    },
    menuStyle() {
      return {
        display: this.showMenu ? 'block' : 'none',
        left: this.alignment === 'right' ? '100%' : this.alignment === 'center' ? '50%' : '',
        transform: this.alignment === 'right' ? 'translate(-100%,0)' : this.alignment === 'center' ? 'translate(-50%,0)' : '',
      }
    },
    displayText() {
      if (!this.modelValue) return this.placeHolder
      const valueMoment = typeof this.modelValue === 'string' ? moment(this.modelValue) : this.modelValue
      return valueMoment && valueMoment.isValid() ? valueMoment.format(this.dateFormat) : this.placeHolder
    },
    canBack() {
      if (!this.min) return true
      return this.min.isBefore(this.internalMomentValue.clone().startOf('year'))
    },
    canNext() {
      if (!this.max) return true
      return this.internalMomentValue.clone().endOf('year').isBefore(this.max)
    },
    internalMomentValue() {
      return moment(this.year + '/' + this.month, 'YYYY/MM')
    },
  },
  methods: {
    openMenu() {
      if (!this.disabled) this.showMenu = true
    },
    closeMenu() {
      this.showMenu = false
    },
    prevYear() {
      if (this.canBack) this.year = String(Number.parseInt(this.year, 10) - 1)
    },
    nextYear() {
      if (this.canNext) this.year = String(Number.parseInt(this.year, 10) + 1)
    },
    selectMonth(index) {
      this.month = String(index + 1).padStart(2, '0')
      const value = this.internalMomentValue.clone()
      this.$emit('update:modelValue', value)
      this.$emit('selected', value.clone())
      this.closeMenu()
    },
    setValue(value) {
      if (typeof value === 'string') value = moment(value)
      if (value && value.isValid()) {
        this.month = value.format('MM')
        this.year = value.format('YYYY')
      }
    },
    isActive(index) {
      const monthValue = moment(`${this.year}/${String(index + 1).padStart(2, '0')}`, 'YYYY/MM')
      return !(this.min && monthValue.isBefore(this.min)) && !(this.max && monthValue.isAfter(this.max))
    },
    isCurrentSelected(year, monthIndex) {
      if (!this.modelValue) return false
      const value = typeof this.modelValue === 'string' ? moment(this.modelValue) : this.modelValue
      return value.isValid() && Number(value.format('MM')) === monthIndex + 1 && Number(value.format('YYYY')) === Number(year)
    },
    getBackgroundColor(year, monthIndex) {
      return this.isCurrentSelected(year, monthIndex) ? this.selectedBackgroundColor : undefined
    },
    clearSelect() {
      this.$emit('update:modelValue', null)
      this.$emit('selected', null)
    },
  },
}
</script>

<style lang="scss">
$lightgray: #d4d4d4;

.vue-monthly-picker {
  .picker {
    .next,
    .prev {
      &:hover {
        cursor: pointer;
      }
    }

    .monthItem {
      .item {
        border-top: 1px solid $lightgray;
        &.active {
          &:hover {
            cursor: pointer;
            background-color: $lightgray;
          }
        }
      }
    }

    .flexbox {
      padding: 0px;
      display: flex;
      flex-wrap: wrap;
      div {
        flex-grow: 1;
        padding: 15px 0;
      }
      .item {
        flex: 1;
        flex-basis: 25%;
      }
    }
  }

  .placeholder {
    color: #8b8b8b;
  }

  .date-popover {
    overflow-x: hidden;
    overflow-y: hidden;
    outline: none;
    max-width: 350px;
    width: 100%;
    border-radius: 0 0 .28571429rem .28571429rem;
    box-shadow: 0 2px 3px 0 rgba(34,36,38,.15);
    background: #fff;
    transition: opacity .1s ease;
    position: absolute;
    margin: auto;
    z-index: 10;
    border: 1px solid $lightgray;
    font-size: 1rem;
    font-weight: 200;
  }

  .month-picker-wrapper {
    position: relative;
    display: block;
    min-width: 200px;
  }

  .month-year-label {
    outline: none;
    .vmp-input-append {
      display: none;
    }
    &:hover .vmp-input-append {
      display: block;
    }
  }
  .text {
    position: relative;
    z-index: 2;
  }
  .month-year-display {
    display: flex;
    justify-content: space-between;
    &:hover {
      cursor: pointer;
    }
  }

  .next,
  .prev {
    width: 16%;
    float: left;
    text-indent: -10000px;
    position: relative;

    &:after {
      content: "";
      position: absolute;
      left: 50%;
      top: 50%;
      -webkit-transform: translateX(-50%) translateY(-50%);
      transform: translateX(-50%) translateY(-50%);
      border: 6px solid transparent;
    }
  }
  .next {
    &:after {
      border-left: 10px solid #000;
      margin-left: 5px;
    }
    &.deactive {
      &:hover {
        cursor: default;
      }
      &:after {
        border-left: 10px solid #999999;
      }
    }
  }

  .prev {
    &:after {
      border-right: 10px solid #000;
      margin-left: -5px;
    }
    &.deactive {
      &:hover {
        cursor: default;
      }
      &:after {
        border-right: 10px solid #999999;
      }
    }
  }

  .input {
    -moz-appearance: none;
    -webkit-appearance: none;
    align-items: center;
    border: 1px solid transparent;
    border-radius: 3px;
    box-shadow: none;
    display: inline-flex;
    font-size: 1rem;
    height: 2.25em;
    justify-content: flex-start;
    line-height: 1.5;
    padding: 2px calc(.625em - 1px);
    position: relative;
    vertical-align: top;
    background-color: #fff;
    border-color: #dbdbdb;
    color: #363636;
    box-shadow: inset 0 1px 2px hsla(0,0%,4%,.1);
    max-width: 100%;
    width: 100%;
  }
  .deactive {
    color: #999999;
  }

  .selected {
    color: #fff;
    text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.25);
    font-weight: bold;
  }
  .display-text {
    width: 100%;
  }

  .display-text-right {
    margin-right: 20px;
  }

  .vmp-input-append {
    position: absolute;
    top: 0;
    right: 0;
    width: 30px;
    height: 100%;
    padding: 6px;
  }
  .vmp-clear-icon {
    display: inline-block;
    width: 100%;
    height: 100%;
    font-style: normal;
    color: #555;
    text-align: center;
    cursor: pointer;
    &:before {
      display: inline-block;
      content: '\2716';
      vertical-align: middle;
    }
  }
}
</style>
