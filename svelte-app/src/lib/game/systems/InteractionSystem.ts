import { CONFIG } from '../config';
import type { Interactable } from '../entities/Interactable';
import type { Chicken } from '../entities/Chicken';
import type { Goat } from '../entities/Goat';
import type { Horse } from '../entities/Horse';
import type { Cat } from '../entities/Cat';
import {
  interactionPrompt,
  nearbyChicken,
  nearbyGoat,
  nearbyHorse,
  nearbyCat,
  playerStamina,
  playerPosition,
  playerInventory,
  visitedAnimals,
  addToInventory,
  removeFromInventory,
  hasItem,
  addNotification,
  get,
  type VisitedAnimal,
  type CarriedItem,
} from '$lib/stores/gameStore';

export class InteractionSystem {
  private interactables: Interactable[] = [];
  private chickens: Chicken[] = [];
  private goatEntities: Goat[] = [];
  private horseEntities: Horse[] = [];
  private catEntities: Cat[] = [];
  private cooldownTimer = 0;
  private currentInteractable: Interactable | null = null;
  private petTargetCat: Cat | null = null;
  private lastNearbyChicken: Chicken | null = null;
  private lastNearbyGoat: Goat | null = null;
  private lastNearbyHorse: Horse | null = null;
  private lastNearbyCat: Cat | null = null;

  register(interactable: Interactable) {
    this.interactables.push(interactable);
  }

  setChickens(chickens: Chicken[]) { this.chickens = chickens; }
  setGoats(goats: Goat[]) { this.goatEntities = goats; }
  setHorses(horses: Horse[]) { this.horseEntities = horses; }
  setCats(cats: Cat[]) { this.catEntities = cats; }

  update(deltaMs: number) {
    if (this.cooldownTimer > 0) {
      this.cooldownTimer -= deltaMs;
    }

    const pos = get(playerPosition);
    const radius = CONFIG.interaction.proximityRadius;

    // Find closest interactable within range
    let closest: Interactable | null = null;
    let closestDist = Infinity;

    for (const inter of this.interactables) {
      const dist = inter.distanceTo(pos.x, pos.y);
      if (dist < radius && dist < closestDist) {
        closest = inter;
        closestDist = dist;
      }
    }

    this.currentInteractable = closest;

    if (closest) {
      const stamina = get(playerStamina);
      let label = closest.label;
      let available = stamina >= closest.staminaCost;

      if (closest.givesItem) {
        // Item pickup source
        if (hasItem(closest.givesItem.id)) {
          label = `Already carrying ${closest.givesItem.label}`;
          available = false;
        } else {
          label = `Pick up ${closest.givesItem.label}`;
          available = true; // Pickups are always available (no stamina cost)
        }
      } else if (closest.requiresItem) {
        // Requires an item to use
        if (!hasItem(closest.requiresItem)) {
          label = closest.requiresItemHint || `Need ${closest.requiresItem}`;
          available = false;
        }
      }

      interactionPrompt.set({ label, cost: closest.staminaCost, available });
    } else {
      // No interactable nearby — check if we can pet a nearby cat
      let closestCatForPet: Cat | null = null;
      let catPetDist = Infinity;
      for (const c of this.catEntities) {
        const d = c.distanceTo(pos.x, pos.y);
        if (d < 60 && d < catPetDist) { closestCatForPet = c; catPetDist = d; }
      }
      if (closestCatForPet) {
        this.petTargetCat = closestCatForPet;
        interactionPrompt.set({ label: `Pet ${closestCatForPet.catName}`, cost: 0, available: true });
      } else {
        this.petTargetCat = null;
        interactionPrompt.set(null);
      }
    }

    // ─── Find nearby animals for info panels ──────────────
    const infoRadius = 80;

    // Chickens
    let closestChicken: Chicken | null = null;
    let chickenDist = Infinity;
    for (const c of this.chickens) {
      const d = c.distanceTo(pos.x, pos.y);
      if (d < infoRadius && d < chickenDist) { closestChicken = c; chickenDist = d; }
    }
    if (closestChicken) {
      nearbyChicken.set({
        id: closestChicken.chickenId, name: closestChicken.chickenName,
        role: closestChicken.role, breed: closestChicken.breed, color: closestChicken.chickenColor,
        hunger: Math.round(closestChicken.hunger), thirst: Math.round(closestChicken.thirst),
        happiness: Math.round(closestChicken.happiness), health: Math.round(closestChicken.health),
        cleanliness: Math.round(closestChicken.cleanliness),
      });
    } else {
      nearbyChicken.set(null);
    }

    // Goats
    let closestGoat: Goat | null = null;
    let goatDist = Infinity;
    for (const g of this.goatEntities) {
      const d = g.distanceTo(pos.x, pos.y);
      if (d < infoRadius && d < goatDist) { closestGoat = g; goatDist = d; }
    }
    if (closestGoat) {
      nearbyGoat.set({
        id: closestGoat.goatId, name: closestGoat.goatName,
        personality: closestGoat.personality, color: closestGoat.goatColor,
        hunger: Math.round(closestGoat.hunger), thirst: Math.round(closestGoat.thirst),
        happiness: Math.round(closestGoat.happiness), health: Math.round(closestGoat.health),
        cleanliness: Math.round(closestGoat.cleanliness),
        mischief: Math.round(closestGoat.mischief),
        hoofCondition: Math.round(closestGoat.hoofCondition), escaped: closestGoat.escaped,
      });
    } else {
      nearbyGoat.set(null);
    }

    // Horses
    let closestHorse: Horse | null = null;
    let horseDist = Infinity;
    for (const h of this.horseEntities) {
      const d = h.distanceTo(pos.x, pos.y);
      if (d < infoRadius && d < horseDist) { closestHorse = h; horseDist = d; }
    }
    if (closestHorse) {
      nearbyHorse.set({
        id: closestHorse.horseId, name: closestHorse.horseName,
        breed: closestHorse.breed, color: closestHorse.horseColor,
        hunger: Math.round(closestHorse.hunger), thirst: Math.round(closestHorse.thirst),
        happiness: Math.round(closestHorse.happiness), health: Math.round(closestHorse.health),
        cleanliness: Math.round(closestHorse.cleanliness),
        coat: Math.round(closestHorse.coat), hoofCondition: Math.round(closestHorse.hoofCondition),
        training: Math.round(closestHorse.training),
      });
    } else {
      nearbyHorse.set(null);
    }

    // Cats
    let closestCat: Cat | null = null;
    let catDist = Infinity;
    for (const c of this.catEntities) {
      const d = c.distanceTo(pos.x, pos.y);
      if (d < infoRadius && d < catDist) { closestCat = c; catDist = d; }
    }
    if (closestCat) {
      nearbyCat.set({
        id: closestCat.catId, name: closestCat.catName,
        color: closestCat.catColor, pattern: closestCat.pattern,
        hunger: Math.round(closestCat.hunger), thirst: Math.round(closestCat.thirst),
        happiness: Math.round(closestCat.happiness), health: Math.round(closestCat.health),
        attention: Math.round(closestCat.attention), fleaCollar: Math.round(closestCat.fleaCollar),
      });
    } else {
      nearbyCat.set(null);
    }

    // ─── Record visited animals to journal when leaving proximity ───
    if (this.lastNearbyChicken && !closestChicken) {
      const c = this.lastNearbyChicken;
      this.recordVisit('chicken', c.chickenId, c.chickenName, {
        hunger: Math.round(c.hunger), thirst: Math.round(c.thirst),
        happiness: Math.round(c.happiness), health: Math.round(c.health),
      });
    }
    this.lastNearbyChicken = closestChicken;

    if (this.lastNearbyGoat && !closestGoat) {
      const g = this.lastNearbyGoat;
      this.recordVisit('goat', g.goatId, g.goatName, {
        hunger: Math.round(g.hunger), thirst: Math.round(g.thirst),
        happiness: Math.round(g.happiness), health: Math.round(g.health),
        mischief: Math.round(g.mischief),
      });
    }
    this.lastNearbyGoat = closestGoat;

    if (this.lastNearbyHorse && !closestHorse) {
      const h = this.lastNearbyHorse;
      this.recordVisit('horse', h.horseId, h.horseName, {
        hunger: Math.round(h.hunger), thirst: Math.round(h.thirst),
        happiness: Math.round(h.happiness), health: Math.round(h.health),
        coat: Math.round(h.coat), hoofCondition: Math.round(h.hoofCondition),
        training: Math.round(h.training),
      });
    }
    this.lastNearbyHorse = closestHorse;

    if (this.lastNearbyCat && !closestCat) {
      const c = this.lastNearbyCat;
      this.recordVisit('cat', c.catId, c.catName, {
        hunger: Math.round(c.hunger), thirst: Math.round(c.thirst),
        happiness: Math.round(c.happiness), health: Math.round(c.health),
        attention: Math.round(c.attention), fleaCollar: Math.round(c.fleaCollar),
      });
    }
    this.lastNearbyCat = closestCat;
  }

  private recordVisit(type: VisitedAnimal['type'], id: number, name: string, stats: Record<string, number>) {
    visitedAnimals.update(list => {
      const existing = list.findIndex(a => a.type === type && a.id === id);
      const entry: VisitedAnimal = { type, id, name, stats, lastSeen: Date.now() };
      if (existing >= 0) {
        list[existing] = entry;
      } else {
        list.push(entry);
      }
      return [...list];
    });
  }

  tryInteract(): boolean {
    if (this.cooldownTimer > 0) return false;

    // Leash escaped goat if carrying leash and near escaped goat
    if (hasItem('leash')) {
      const pos = get(playerPosition);
      for (const goat of this.goatEntities) {
        if (goat.escaped && goat.distanceTo(pos.x, pos.y) < 60) {
          removeFromInventory('leash');
          // Return goat — use game event so GoatMischiefSystem handles it
          goat.escaped = false;
          goat.mischief = Math.max(0, goat.mischief - 20);
          goat.syncToStore();
          addNotification(`${goat.goatName} has been leashed and returned to the pen!`, 'positive');
          this.cooldownTimer = CONFIG.interaction.cooldownMs;
          return true;
        }
      }
    }

    // Pet cat if no interactable but cat is nearby
    if (!this.currentInteractable && this.petTargetCat) {
      this.petTargetCat.pet(CONFIG.cats.attention.petBoost);
      this.petTargetCat.syncToStore();
      addNotification(`${this.petTargetCat.catName} purrs happily!`, 'positive');
      this.cooldownTimer = CONFIG.interaction.cooldownMs;
      return true;
    }

    if (!this.currentInteractable) return false;

    const inter = this.currentInteractable;
    const stamina = get(playerStamina);
    if (stamina < inter.staminaCost) return false;

    // ─── Item pickup ─────────────────────────────────────
    if (inter.givesItem) {
      if (hasItem(inter.givesItem.id)) {
        addNotification(`Already carrying ${inter.givesItem.label}.`, 'info');
        return false;
      }
      const item: CarriedItem = {
        id: inter.givesItem.id,
        label: inter.givesItem.label,
        spriteKey: inter.givesItem.spriteKey,
        sourceId: inter.id,
      };
      addToInventory(item);
      addNotification(`Picked up ${inter.givesItem.label}.`, 'info');
      this.cooldownTimer = CONFIG.interaction.cooldownMs;
      return true;
    }

    // ─── Item-required interaction ────────────────────────
    if (inter.requiresItem) {
      if (!hasItem(inter.requiresItem)) {
        addNotification(inter.requiresItemHint || `You need a ${inter.requiresItem} first.`, 'warning');
        return false;
      }
      // Use the item
      playerStamina.update(s => Math.max(0, s - inter.staminaCost));
      inter.onInteract();
      removeFromInventory(inter.requiresItem);
      this.cooldownTimer = CONFIG.interaction.cooldownMs;
      return true;
    }

    // ─── Normal interaction ──────────────────────────────
    playerStamina.update(s => Math.max(0, s - inter.staminaCost));
    inter.onInteract();
    this.cooldownTimer = CONFIG.interaction.cooldownMs;

    return true;
  }
}
