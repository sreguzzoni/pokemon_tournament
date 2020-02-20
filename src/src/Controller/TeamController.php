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

/**
 * @Route("/team")
 */
class TeamController extends AbstractController
{

    const FIRST_POKEMON = 1;
    const LAST_POKEMON = 807;
    const MAX_POKEMON = 6;

    /**
     * @Route("/", name="team_index", methods={"GET"})
     */
    public function index(TeamRepository $teamRepository): Response
    {
        $teams = $teamRepository->findByUser($this->getUser());
        foreach ($teams as $team) {
            $team->getPokemon();
        }
        return $this->render('team/index.html.twig', [
            'teams' => $teams,
        ]);
    }

    /**
     * @Route("/new", name="team_new", methods={"GET","POST"})
     */
    public function new(Request $request): Response
    {
        $team = new Team();
        $form = $this->createForm(TeamType::class, $team);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $team->setUser($this->getUser());
            $team->setDatetime(new \Datetime());
            $entityManager = $this->getDoctrine()->getManager();
            $entityManager->persist($team);
            $entityManager->flush();

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
            $this->getDoctrine()->getManager()->flush();

            return $this->redirectToRoute('team_index');
        }

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
        }

        return $this->redirectToRoute('team_index');
    }

    /**
     * @Route("/addPokemon", name="team_addPokemon", methods={"POST"})
     */
    public function addPokemon(Request $request)
    {
        $teamId = $request->request->get('teamId');
        if($teamId){
            $entityManager = $this->getDoctrine()->getManager();
            $teamRepository = $entityManager->getRepository(Team::class);
            $team = $teamRepository->find($teamId);
            if($team->countPokemon() < 6) {
                $pokemon = new Pokemon();
                $pokemon->setTeam($team);
                $number = rand(self::FIRST_POKEMON, self::LAST_POKEMON);
                $pokemon->setNumber($number);

                $entityManager->persist($pokemon);
                $entityManager->flush();

                //make something curious, get some unbelieveable data
                return new JsonResponse(json_decode($pokemon->__toString()));
            }
        }
        // temp management of exception and error
        header('HTTP/1.1 500 Internal Server Error');
        header('Content-Type: application/json; charset=UTF-8');
        die(json_encode(array('message' => 'addPokemon: Cannot add a Pokemon', 'code' => 1001)));
    }

    /**
    * @Route("/removePokemon", name="team_removePokemon", methods={"POST"})
    */
    public function removePokemon(Request $request)
    {
        $pokemonId = $request->request->get('pokemonId');
        if($pokemonId){
            $entityManager = $this->getDoctrine()->getManager();
            
            $pokemonRepository = $entityManager->getRepository(Pokemon::class);
            $pokemon = $pokemonRepository->find($pokemonId);
            
            $entityManager->remove($pokemon);
            $entityManager->flush();

            //make something curious, get some unbelieveable data
            return new JsonResponse(['id' => $pokemonId]);
        }
        // temp management of exception and error
        header('HTTP/1.1 500 Internal Server Error');
        header('Content-Type: application/json; charset=UTF-8');
        die(json_encode(array('message' => 'removePokemon: Cannot remove the Pokemon', 'code' => 1002)));
    }


}
