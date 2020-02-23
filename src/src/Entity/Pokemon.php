<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use PokePHP\PokeApi;

/**
 * @ORM\Entity(repositoryClass="App\Repository\PokemonRepository")
 */
class Pokemon
{
    /**
     * @ORM\Id()
     * @ORM\GeneratedValue()
     * @ORM\Column(type="integer")
     */
    private $id;

    /**
     * @ORM\ManyToOne(targetEntity="App\Entity\Team", inversedBy="pokemon")
     * @ORM\JoinColumn(nullable=false)
     */
    private $team;

    /**
     * @ORM\Column(type="smallint")
     */
    private $number;

    /**
     * Attributes picked from API and cached into the single object.
     */
    private $pokemon_obj;
    private $pokemon_name;
    private $pokemon_exp;
    private $pokemon_img;
    private $pokemon_abilities;
    private $pokemon_types;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getTeam(): ?Team
    {
        return $this->team;
    }

    public function setTeam(?Team $team): self
    {
        $this->team = $team;
        return $this;
    }

    public function getNumber(): ?int
    {
        return $this->number;
    }

    public function getName(): ?String
    {
        return $this->pokemon_name;
    }

    public function getExp(): ?int
    {
        return $this->pokemon_exp;
    }

    public function getImg(): ?String
    {
        return $this->pokemon_img;
    }

    public function getAbilities()
    {
        return $this->pokemon_abilities;
    }

    public function getTypes()
    {
        return $this->pokemon_types;   
    }

    public function setNumber(int $number): self
    {
        $this->number = $number;
        // retrieve pokemon informations when setting the Pokemon number
        $this->setPokemonInfo();
        return $this;
    }

    public function setPokemonInfo() 
    {
        $api = new PokeApi;
        // pick only once information from API
        $this->pokemon_obj = json_decode(
            $api->pokemon($this->getNumber())
        );
        // parse the retrieved informations
        $this->pokemon_name = $this->pokemon_obj->name;
        $this->pokemon_exp = $this->pokemon_obj->base_experience;
        $this->pokemon_img = $this->pokemon_obj->sprites->front_default;
        $this->pokemon_abilities = array();
        foreach ($this->pokemon_obj->abilities as $ability_obj) {
            array_push($this->pokemon_abilities, $ability_obj->ability->name);
        }
        $this->pokemon_types = array();
        foreach ($this->pokemon_obj->types as $type_obj) {
            array_push($this->pokemon_types, $type_obj->type->name);
        }

    }

    public function __toString() {
        return json_encode([
            'id' => $this->getId(),
            'number' => $this->getNumber(),
            'name' => $this->getName(),
            'exp' => $this->getExp(),
            'img' => $this->getImg(),
            'abilities' => $this->getAbilities(),
            'types' => $this->getTypes()
        ]);
    }

}
