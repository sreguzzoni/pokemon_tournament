<?php

namespace App\Controller;

use App\Entity\Team;
use App\Entity\Pokemon;
use App\Form\TeamType;
use App\Repository\TeamRepository;
use App\Repository\PokemonRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Cache\Adapter\FilesystemAdapter;
use Symfony\Contracts\Cache\ItemInterface;

/**
 * @Route("/team")
 */
class TeamController extends AbstractController
{

    /*
     * Cache object for teams
     */
    private $cache;

    /*
     * Useful const
     */
    const FIRST_POKEMON = 1;
    const LAST_POKEMON = 807;
    const MAX_POKEMON = 6;

    public function __construct()
    {
        $this->cache = new FilesystemAdapter();
    }

    /**
     * @Route("/list", name="team_index", methods={"GET"})
     */
    public function index(TeamRepository $teamRepository): Response
    {

        $userId = $this->getUser()->getId();

        // get from cache team filtered by userId
        $teamsIds = $this->cache->get('user-' . $userId, function(ItemInterface $item) use ($teamRepository, $userId) {
            $ids = array();
            foreach ($teamRepository->findByUser($this->getUser()->getId()) as $team) {
                array_push($ids, $team->getId());
            }
            return $ids;
        });


        // init empty array for teams
        $teams = array();

        foreach ($teamsIds as $teamId) {
            $team = $this->cache->get('team-' . $teamId, function(ItemInterface $item) use ($teamRepository, $teamId) {
                $team_tmp = $teamRepository->find($teamId);
                $team_tmp->getPokemon();
                return $team_tmp;
            });
            array_push($teams, $team);
        }


        // return the list
        return $this->render('team/index.html.twig', [
            'teams' => $teams,
        ]);
    }

    /**
     * @Route("/create", name="team_new", methods={"GET","POST"})
     */
    public function new(Request $request): Response
    {
        $team = new Team();
        $form = $this->createForm(TeamType::class, $team);
        
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $pokemon = $form['pokemon']->getData();
            $pokemon = explode(',', $pokemon);        
            
            $team->setUser($this->getUser());
            $team->setDatetime(new \Datetime());
            $entityManager = $this->getDoctrine()->getManager();
            $entityManager->persist($team);
            $entityManager->flush();

            if($pokemon[0] != "") {
                foreach ($pokemon as $single_pokemon) {
                    $pokemon = new Pokemon();
                    $pokemon->setTeam($team);
                    $pokemon->setNumber((int)$single_pokemon);
                    // save pokemon
                    $entityManager->persist($pokemon);
                    $entityManager->flush();
                }
            }

            // clear cache about this user
            $this->cache->delete('user-' . $this->getUser()->getId());

            return $this->redirectToRoute('team_index');
        }

        return $this->render('team/new.html.twig', [
            'team' => $team,
            'form' => $form->createView(),
        ]);
    }

    /**
     * @Route("/{id}", name="team_show", methods={"GET"})
     */
    public function show(Team $team): Response
    {
        return $this->render('team/show.html.twig', [
            'team' => $team,
            'pokemon' => $team->getPokemon()
        ]);
    }

    /**
     * @Route("/{id}/edit", name="team_edit", methods={"GET","POST"})
     */
    public function edit(Request $request, Team $team): Response
    {
        $form = $this->createForm(TeamType::class, $team);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $pokemon = $form['pokemon']->getData();
            $pokemon = explode(',', $pokemon);        

            $entityManager = $this->getDoctrine()->getManager();
            
            // delete old pokemon
            foreach ($team->getPokemon() as $pokemon_in_team) {
                $pokemonNumber = $pokemon_in_team->getNumber();
                if(in_array((String)$pokemonNumber, (array)$pokemon) == false) {
                    // if an old pokemon isn't in the new list
                    $pokemonRepository = $entityManager->getRepository(Pokemon::class);
                    $pokemon_to_remove = $pokemonRepository->findOneByTeamAndNumber($team->getId(), $pokemonNumber);
                    // delete Pokemon
                    $entityManager->remove($pokemon_to_remove);
                    $entityManager->flush();
                }
            }


            if($pokemon[0] != "") {
                // add new ones
                foreach ($pokemon as $single_pokemon) {
                    if($team->hasPokemon((int)$single_pokemon) == false) {
                        $pokemon = new Pokemon();
                        $pokemon->setTeam($team);
                        $pokemon->setNumber((int)$single_pokemon);
                        // save pokemon
                        $entityManager->persist($pokemon);
                        $entityManager->flush();
                    }
                }
            }

            $entityManager->flush();

            // clear cache about this team
            $this->cache->delete('team-' . $team->getId());

            return $this->redirectToRoute('team_index');
        }
        $team->getPokemon();
        return $this->render('team/edit.html.twig', [
            'team' => $team,
            'form' => $form->createView(),
        ]);
    }

    /**
     * @Route("/{id}", name="team_delete", methods={"DELETE"})
     */
    public function delete(Request $request, Team $team): Response
    {
        if ($this->isCsrfTokenValid('delete'.$team->getId(), $request->request->get('_token'))) {
            $entityManager = $this->getDoctrine()->getManager();
            $entityManager->remove($team);
            $entityManager->flush();
            // clear cache about this user
            $this->cache->delete('user-' . $this->getUser()->getId());
        }

        return $this->redirectToRoute('team_index');
    }

    /**
     * @Route("/addPokemon", name="team_addPokemon", methods={"POST"})
     */
    public function addPokemon(Request $request)
    {
        // pick team id from the AJAX request
        $teamId = $request->request->get('teamId');
        if($teamId){
            // pick repository to find related team object
            $entityManager = $this->getDoctrine()->getManager();
            $teamRepository = $entityManager->getRepository(Team::class);
            $team = $teamRepository->find($teamId);
            if($team->countPokemon() < 6) {
                // if there aren't 6 pokemons
                $pokemon = new Pokemon();
                $pokemon->setTeam($team);
                // select random pokemon number
                $number = rand(self::FIRST_POKEMON, self::LAST_POKEMON);
                $pokemon->setNumber($number);
                // save pokemon
                $entityManager->persist($pokemon);
                $entityManager->flush();
                // return the Pokemon JSON object
                return new JsonResponse(json_decode($pokemon->__toString()));
            }
        }
        // temp management of exception and error
        die(new JsonResponse(['message' => 'addPokemon: Cannot add a Pokemon', 'code' => 1001], 500));
    }

    /**
    * @Route("/removePokemon", name="team_removePokemon", methods={"POST"})
    */
    public function removePokemon(Request $request)
    {
        // pick Pokemon from the AJAX request
        $pokemonId = $request->request->get('pokemonId');
        if($pokemonId){
            // pick repository to find related Pokemon object
            $entityManager = $this->getDoctrine()->getManager();
            $pokemonRepository = $entityManager->getRepository(Pokemon::class);
            $pokemon = $pokemonRepository->find($pokemonId);
            // delete Pokemon
            $entityManager->remove($pokemon);
            $entityManager->flush();

            // return the Pokemon id as JSON object
            return new JsonResponse(['id' => $pokemonId]);
        }
        // temp management of exception and error
        die(new JsonResponse(['message' => 'removePokemon: Cannot remove a Pokemon', 'code' => 1002], 500));
    }

}
