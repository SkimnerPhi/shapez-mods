const METADATA = {
  website: 'https://github.com/SkimnerPhi/shapez-mods',
  author: 'SkimnerPhi',
  name: 'Adjustable Delay',
  version: '1.2',
  id: 'adjustable-delay',
  description: 'Adds a wire building that delays signals by a player-set number of ticks',
  minimumGameVersion: '>=1.5.0'
};

/* 
 * 1.0: Initial release
 * 1.1: Fixed bug where Adjustable Delay could predict the future when delay < 0
 * 1.2: Delay setting copies properly when using blueprints
 */

class AdjustableDelayComponent extends shapez.Component {
  static getId() {
    return 'AdjustableDelay';
  }
  
  static getSchema() {
    return {
      signals: shapez.types.array(
        shapez.types.nullable(shapez.typeItemSingleton)
      )
    };
  }
  
  constructor(delay = 1) {
    super();
    
    this.currentIdx = 0;
    this.signals = new Array(delay - 1);
  }
  
  get delay() {
    return this.signals.length + 1;
  }
  set delay(delay) {
    const newArray = new Array(delay - 1);
    const limit = Math.min(newArray.length, this.signals.length);
    for(let idx = 0; idx < limit; idx++) {
      const oldIdx = (idx + this.currentIdx) % this.signals.length;
      newArray[idx] = this.signals[oldIdx];
    }
      
    this.signals = newArray;
    this.currentIdx = 0;
  }
  
  copyAdditionalStateTo(otherComponent) {
    otherComponent.delay = this.delay;
  }
}
class AdjustableDelaySystem extends shapez.GameSystemWithFilter {
  constructor(root) {
    super(root, [AdjustableDelayComponent]);
    
    this.root.signals.entityManuallyPlaced.add(entity => {
      const editorHud = this.root.hud.parts.adjustableDelayEdit;
      if(editorHud) {
        editorHud.editDelayText(entity, {deleteOnCancel: true});
      }
    });
  }
  update() {
    for(let idx = 0; idx < this.allEntities.length; idx++) {
      const entity = this.allEntities[idx];
      const delayComp = entity.components.AdjustableDelay;
      const slotComp = entity.components.WiredPins;
      
      if(delayComp.delay == 1) {
        const inputNetwork = slotComp.slots[0].linkedNetwork;
        let inputValue = null;
        if(!inputNetwork?.valueConflict) {
          inputValue = inputNetwork?.currentValue;
        }
        
        slotComp.slots[1].value = inputValue;
      } else {
        slotComp.slots[1].value = delayComp.signals[delayComp.currentIdx];
        
        const inputNetwork = slotComp.slots[0].linkedNetwork;
        let inputValue = null;
        if(!inputNetwork?.valueConflict) {
          inputValue = inputNetwork?.currentValue;
        }
        delayComp.signals[delayComp.currentIdx] = inputValue;
        
        delayComp.currentIdx = ++delayComp.currentIdx % delayComp.signals.length;
      }
    }
  }
}
class MetaAdjustableDelayBuilding extends shapez.ModMetaBuilding {
  constructor() {
    super('adjustableDelay');
  }
  static getAllVariantCombinations() {
    return [
      {
        variant: shapez.defaultBuildingVariant,
        name: 'Adjustable Delay',
        description: 'Delays signals by the set amount of ticks',
        regularImageBase64: RESOURCES.adjustable_delay.base,
        blueprintImageBase64: RESOURCES.adjustable_delay.ghost,
        tutorialImageBase64: RESOURCES.adjustable_delay.base
      }
    ];
  }
  getSilhouetteColor() {
    return '#a086b5';
  }
  getIsUnlocked(root) {
    return root.hubGoals.isRewardUnlocked(shapez.enumHubGoalRewards.reward_logic_gates);
  }
  getLayer() {
    return 'wires';
  }
  getDimensions() {
    return new shapez.Vector(1, 1);
  }
  getRenderPins() {
    return false;
  }
  setupEntityComponents(entity) {
    entity.addComponent(
      new shapez.WiredPinsComponent({
        slots: [
          {
            pos: new shapez.Vector(0, 0),
            direction: shapez.enumDirection.bottom,
            type: shapez.enumPinSlotType.logicalAcceptor
          },
          {
            pos: new shapez.Vector(0, 0),
            direction: shapez.enumDirection.top,
            type: shapez.enumPinSlotType.logicalEjector
          }
        ]
      })
    );
    
    entity.addComponent(new AdjustableDelayComponent());
  }
}

class HUDAdjustableDelayEdit extends shapez.BaseHUDPart {
  initialize() {
    this.root.camera.downPreHandler.add(this.downPreHandler, this);
  }
  
  downPreHandler(pos, button) {
    if(this.root.currentLayer !== 'wires') {
      return;
    }
    
    const tile = this.root.camera.screenToWorld(pos).toTileSpace();
    const contents = this.root.map.getLayerContentXY(tile.x, tile.y, 'wires');
    if(contents) {
      const delayComp = contents.components.AdjustableDelay;
      if(delayComp) {
        if(button === shapez.enumMouseButton.left) {
          this.editDelayText(contents, {
            deleteOnCancel: false
          });
          return shapez.STOP_PROPOGATION;
        }
      }
    }
  }
  
  editDelayText(entity, {deleteOnCancel = true}) {
    const delayComp = entity.components.AdjustableDelay;
    if(!delayComp) {
      return;
    }
    
    const uid = entity.uid;
    
    const textInput = new shapez.FormElementInput({
      id: 'delayAmount',
      placeholder: '',
      defaultValue: '' + delayComp.delay,
      validator: val => Number.parseInt(val) > 0
    });
    
    const dialog = new shapez.DialogWithForm({
      app: this.root.app,
      title: 'Delay amount',
      desc: 'Number of ticks to delay the input signal:',
      formElements: [textInput],
      buttons: ['cancel:bad:escape', 'ok:good:enter'],
      closeButton: false
    });
    this.root.hud.parts.dialogs.internalShowDialog(dialog);
    
    dialog.buttonSignals.ok.add(() => {
      if(!this.root?.entityMgr) {
        return;
      }
      
      const entityRef = this.root.entityMgr.findByUid(uid, false);
      if(!entityRef) {
        return;
      }
      
      const delayComp = entityRef.components.AdjustableDelay;
      if(!delayComp) {
        return;
      }
      
      delayComp.delay = Number.parseInt(textInput.getValue());
    });
    
    if(deleteOnCancel) {
      dialog.buttonSignals.cancel.add(() => {
        if(!this.root?.entityMgr) {
          return;
        }
        
        const entityRef = this.root.entityMgr.findByUid(uid, false);
        if(!entityRef) {
          return;
        }
        
        const delayComp = entityRef.components.AdjustableDelay;
        if(!delayComp) {
          return;
        }
        
        this.root.logic.tryDeleteBuilding(entityRef);
      });
    }
  }
}

class Mod extends shapez.Mod {
  init() {
    this.modInterface.registerComponent(AdjustableDelayComponent);
    
    this.modInterface.registerNewBuilding({
      metaClass: MetaAdjustableDelayBuilding,
      buildingIconBase64: RESOURCES.adjustable_delay.icon
    });
    
    this.modInterface.addNewBuildingToToolbar({
      toolbar: 'wires',
      location: 'primary',
      metaClass: MetaAdjustableDelayBuilding
    });
    
    this.modInterface.registerGameSystem({
      id: 'adjustableDelay',
      systemClass: AdjustableDelaySystem,
      before: 'constantSignal'
    });
    
    this.modInterface.registerHudElement('adjustableDelayEdit', HUDAdjustableDelayEdit);
  }
}

const RESOURCES = {
  adjustable_delay: {
    icon: 'data:image/png;base64,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',
    base: 'data:image/png;base64,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',
    ghost: 'data:image/png;base64,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'
  }
};
