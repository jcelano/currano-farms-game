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
  get,
} from '$lib/stores/gameStore';

export class InteractionSystem {
  private interactables: Interactable[] = [];
  private chickens: Chicken[] = [];
  private goatEntities: Goat[] = [];
  private horseEntities: Horse[] = [];
  private catEntities: Cat[] = [];
  private cooldownTimer = 0;
  private currentInteractable: Interactable | null = null;

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
      interactionPrompt.set({
        label: closest.label,
        cost: closest.staminaCost,
        available: stamina >= closest.staminaCost,
      });
    } else {
      interactionPrompt.set(null);
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
  }

  tryInteract(): boolean {
    if (!this.currentInteractable) return false;
    if (this.cooldownTimer > 0) return false;

    const stamina = get(playerStamina);
    if (stamina < this.currentInteractable.staminaCost) return false;

    playerStamina.update(s => Math.max(0, s - this.currentInteractable!.staminaCost));
    this.currentInteractable.onInteract();
    this.cooldownTimer = CONFIG.interaction.cooldownMs;

    return true;
  }
}
