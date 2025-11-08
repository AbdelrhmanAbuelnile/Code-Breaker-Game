// Codemaker
// CodeBreaker
import { useState, useEffect } from "react";
import { ColorSelectionDialog } from "./components/ColorSelectionDialog";
import { SecretCodeDialog } from "./components/SecretCodeDialog";
import { PlayerSetupDialog } from "./components/PlayerSetupDialog";
import { RoleAssignmentDialog } from "./components/RoleAssignmentDialog";
import { Button } from "./components/ui/button";
import confetti from "canvas-confetti";

import diceSounce from "./assets/dice-roll.mp3";
import gameStart from "./assets/game-start.mp3";
import codeMakerWinSound from "./assets/codemaker-win.mp3";
import codeBreakerWinSound from "./assets/codebreaker-win.mp3";
import peicePlacingSound from "./assets/peice-placing1.mp3";
import peicePlacingSound2 from "./assets/peice-placing2.mp3";
import peicePlacingSound3 from "./assets/peice-placing3.mp3";
import peicePlacingSound4 from "./assets/peice-placing4.mp3";

import {
	saveGameState,
	loadGameState,
	clearGameState,
	hasStoredGame,
	savePlayers,
	loadPlayers,
	clearPlayers,
	hasStoredPlayers,
} from "./lib/gameStorage";

const CodeBreakerPegColors = [
	"red",
	"blue",
	"green",
	"purple",
	"cyan",
	"yellow",
	"orange",
];
const CodeMakerPegColors = ["black", "white"];

interface Guess {
	pegs: (string | null)[];
	feedback: (string | null)[];
	isSubmitted: boolean;
}

const randomizePeicePlacingSound = () => {
	const sounds = [
		peicePlacingSound,
		peicePlacingSound2,
		peicePlacingSound3,
		peicePlacingSound4,
	];
	const randomIndex = Math.floor(Math.random() * sounds.length);
	return sounds[randomIndex];
};

function GameBoard() {
	// Player state
	const [codeMakerName, setCodeMakerName] = useState<string>("");
	const [codeBreakerName, setCodeBreakerName] = useState<string>("");
	const [showPlayerSetup, setShowPlayerSetup] = useState(false);
	const [showRoleAssignment, setShowRoleAssignment] = useState(false);
	const [isAssigningRoles, setIsAssigningRoles] = useState(false);

	// Game state
	const [secretCode, setSecretCode] = useState<(string | null)[]>([
		null,
		null,
		null,
		null,
	]);
	const [currentRow, setCurrentRow] = useState(0);
	const [guesses, setGuesses] = useState<Guess[]>(
		Array.from({ length: 10 }, () => ({
			pegs: [null, null, null, null],
			feedback: [null, null, null, null],
			isSubmitted: false,
		}))
	);
	const [selectedColor, setSelectedColor] = useState<string | null>(null);
	const [gameStatus, setGameStatus] = useState<
		"settingSecret" | "playing" | "won" | "lost"
	>("settingSecret");
	const [currentPlayer, setCurrentPlayer] = useState<
		"codemaker" | "codebreaker"
	>("codemaker");

	// Dialog states
	const [colorDialogOpen, setColorDialogOpen] = useState(false);
	const [secretCodeDialogOpen, setSecretCodeDialogOpen] = useState(false);
	const [selectedPosition, setSelectedPosition] = useState<{
		row: number;
		col: number;
	} | null>(null);
	const [dialogPlayerType, setDialogPlayerType] = useState<
		"codebreaker" | "codemaker"
	>("codebreaker");

	// Initialize game - load from storage or start fresh
	useEffect(() => {
		const savedPlayers = loadPlayers();
		const savedGame = loadGameState();

		if (savedPlayers && hasStoredPlayers()) {
			setCodeMakerName(savedPlayers.codeMakerName);
			setCodeBreakerName(savedPlayers.codeBreakerName);

			if (savedGame && hasStoredGame()) {
				setSecretCode(savedGame.secretCode);
				setCurrentRow(savedGame.currentRow);
				setGuesses(savedGame.guesses);
				setGameStatus(savedGame.gameStatus);
				setSelectedColor(savedGame.selectedColor);
				setCurrentPlayer(savedGame.currentPlayer);
				console.log("Game loaded from storage");
			}
		} else {
			// No players set, show player setup
			setShowPlayerSetup(true);
		}
	}, []);

	// Save game state whenever it changes
	useEffect(() => {
		if (codeMakerName && codeBreakerName) {
			saveGameState({
				secretCode,
				currentRow,
				guesses,
				gameStatus,
				selectedColor,
				currentPlayer,
				players: {
					codeMakerName,
					codeBreakerName,
				},
			});
		}
	}, [
		secretCode,
		currentRow,
		guesses,
		gameStatus,
		selectedColor,
		currentPlayer,
		codeMakerName,
		codeBreakerName,
	]);

	useEffect(() => {
		console.log("🚀 ~ GameBoard ~ secretCode:", secretCode);
	}, [secretCode]);

	// Handle player setup
	const handlePlayersSet = (player1: string, player2: string) => {
		setShowPlayerSetup(false);
		setShowRoleAssignment(true);
		setIsAssigningRoles(true);
		// play the dice sound
		const diceSound = new Audio(diceSounce);
		diceSound.play();

		// Random assignment after 1.5 seconds
		setTimeout(() => {
			const isCoinFlip = Math.random() < 0.5;
			if (isCoinFlip) {
				setCodeMakerName(player1);
				setCodeBreakerName(player2);
			} else {
				setCodeMakerName(player2);
				setCodeBreakerName(player1);
			}

			savePlayers({
				codeMakerName: isCoinFlip ? player1 : player2,
				codeBreakerName: isCoinFlip ? player2 : player1,
			});

			setIsAssigningRoles(false);

			// Close dialog after showing results for 2 seconds
			setTimeout(() => {
				setShowRoleAssignment(false);
			}, 2000);
		}, 1500);
	};

	// Handle placing a peg for secret code (CodeMaker setting initial secret)
	const handleSecretCodeSlotClick = (col: number) => {
		if (gameStatus !== "settingSecret") return;

		setSelectedPosition({ row: -1, col }); // -1 indicates secret code row
		setDialogPlayerType("codebreaker"); // Use codebreaker colors for secret
		setColorDialogOpen(true);
	};

	// Handle placing a peg - open color selection dialog
	const handleCodebreakerSlotClick = (row: number, col: number) => {
		if (gameStatus !== "playing") return;
		if (currentPlayer !== "codebreaker") return;
		if (row !== currentRow) return; // Only current row is active
		if (guesses[row].isSubmitted) return; // Can't modify submitted guess

		setSelectedPosition({ row, col });
		setDialogPlayerType("codebreaker");
		setColorDialogOpen(true);
	};

	// Handle feedback peg placement (CodeMaker evaluating guess)
	const handleCodeMakerSlotClick = (row: number, col: number) => {
		if (gameStatus !== "playing") return;
		if (currentPlayer !== "codemaker") return;
		if (!guesses[row].isSubmitted) return; // Only for submitted guesses
		if (row !== currentRow) return; // Only current row

		setSelectedPosition({ row, col });
		setDialogPlayerType("codemaker");
		setColorDialogOpen(true);
	};

	// Handle color selection from dialog
	const handleColorSelection = (color: string, row: number, col: number) => {
		const diceSound = new Audio(randomizePeicePlacingSound());
		diceSound.play();
		if (row === -1) {
			// Setting secret code
			setSecretCode((prev) => {
				const newSecret = [...prev];
				newSecret[col] = color;
				return newSecret;
			});
		} else if (dialogPlayerType === "codebreaker") {
			setGuesses((prev) => {
				const newGuesses = [...prev];
				newGuesses[row].pegs[col] = color;
				return newGuesses;
			});
			setSelectedColor(color);
		} else if (dialogPlayerType === "codemaker") {
			// CodeMaker placing feedback
			setGuesses((prev) => {
				const newGuesses = [...prev];
				newGuesses[row].feedback[col] = color;
				return newGuesses;
			});
		}
	};

	// CodeMaker confirms secret code
	const confirmSecretCode = () => {
		if (secretCode.some((peg) => peg === null)) {
			alert("Please set all 4 pegs for the secret code!");
			return;
		}
		setGameStatus("playing");
		setCurrentPlayer("codebreaker");
		const diceSound = new Audio(gameStart);
		diceSound.play();
	};

	// CodeBreaker submits guess
	const submitGuess = () => {
		const currentGuess = guesses[currentRow];

		// Check if all pegs are placed
		if (currentGuess.pegs.some((peg) => peg === null)) {
			alert("Please fill all slots before submitting!");
			return;
		}

		setGuesses((prev) => {
			const newGuesses = [...prev];
			newGuesses[currentRow].isSubmitted = true;
			return newGuesses;
		});

		// Switch to CodeMaker for evaluation
		setCurrentPlayer("codemaker");
	};

	// CodeMaker submits feedback
	const submitFeedback = () => {
		const currentGuess = guesses[currentRow];

		// // Check if all feedback pegs are placed
		// if (currentGuess.feedback.some((peg) => peg === null)) {
		// 	alert("Please place all feedback pegs before submitting!");
		// 	return;
		// }

		// Check win condition (4 black pegs)
		const blackPegs = currentGuess.feedback.filter((f) => f === "black").length;
		if (blackPegs === 4) {
			setGameStatus("won");
			const diceSound = new Audio(codeBreakerWinSound);
			diceSound.play();
			const duration = 5 * 1000;
			const animationEnd = Date.now() + duration;
			const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
			const randomInRange = (min: number, max: number) =>
				Math.random() * (max - min) + min;
			const interval = window.setInterval(() => {
				const timeLeft = animationEnd - Date.now();
				if (timeLeft <= 0) {
					return clearInterval(interval);
				}
				const particleCount = 50 * (timeLeft / duration);
				confetti({
					...defaults,
					particleCount,
					origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
				});
				confetti({
					...defaults,
					particleCount,
					origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
				});
			}, 250);
			return;
		}

		// Move to next row or end game
		if (currentRow === 9) {
			setGameStatus("lost");
			const diceSound = new Audio(codeMakerWinSound);
			diceSound.play();
		} else {
			setCurrentRow((prev) => prev + 1);
			setCurrentPlayer("codebreaker");
		}
	};

	const resetGame = () => {
		setSecretCode([null, null, null, null]);
		setCurrentRow(0);
		setGuesses(
			Array.from({ length: 10 }, () => ({
				pegs: [null, null, null, null],
				feedback: [null, null, null, null],
				isSubmitted: false,
			}))
		);
		setSelectedColor(null);
		setGameStatus("settingSecret");
		setCurrentPlayer("codemaker");
		clearGameState();
	};

	// Reset players (allows new players to join)
	const resetPlayers = () => {
		clearPlayers();
		clearGameState();
		setCodeMakerName("");
		setCodeBreakerName("");
		setShowPlayerSetup(true);
		resetGame();
	};

	// Cancel game (resets everything including players)
	const cancelGame = () => {
		if (
			confirm(
				"Are you sure you want to cancel the game? All progress will be lost."
			)
		) {
			resetPlayers();
		}
	};

	return (
		<div className="flex flex-col gap-4 w-full md:container lg:w-5/12 h-screen p-8">
			{/* Player Setup Dialog */}
			<PlayerSetupDialog
				open={showPlayerSetup}
				onPlayersSet={handlePlayersSet}
			/>

			{/* Role Assignment Dialog */}
			<RoleAssignmentDialog
				open={showRoleAssignment}
				codeMakerName={codeMakerName}
				codeBreakerName={codeBreakerName}
				isAnimating={isAssigningRoles}
			/>

			{/* Game Controls - Outside the board */}
			<div className="flex flex-col justify-center items-center bg-white p-1.5 md:p-4 rounded-lg shadow-md gap-2">
				<div className="flex flex-wrap items-center justify-center gap-4 w-full">
					{/* <h1 className="text-xl md:text-2xl font-bold">Mastermind</h1> */}

					<div className="w-full text-center flex justify-center items-center gap-2">
						{/* <span className="text-sm font-medium hidden md:inline">
							Current Turn:
						</span> */}
						{codeMakerName && (
							<span
								className={`px-2 py-1 md:px-3 md:py-1 rounded-full font-bold text-sm ${
									currentPlayer === "codemaker"
										? "bg-purple-500 text-white"
										: "bg-blue-500 text-white"
								}`}
							>
								{currentPlayer === "codemaker"
									? codeMakerName
									: codeBreakerName}
							</span>
						)}
						{/* <span className="text-xs text-gray-600 hidden md:inline">
							({currentPlayer === "codemaker" ? "Code Maker" : "Code Breaker"})
						</span> */}
					</div>

					<div className="w-full flex justify-center items-center gap-2">
						<Button
							onClick={resetPlayers}
							variant="outline"
							size="sm"
							className="text-xs"
						>
							Reset Players
						</Button>
						<Button
							onClick={cancelGame}
							variant="destructive"
							size="sm"
							className="text-xs"
						>
							Cancel Game
						</Button>
					</div>
				</div>

				{gameStatus === "settingSecret" && (
					<div className="w-full p-4 bg-purple-100 rounded-lg">
						<h3 className="text-sm font-bold mb-3 text-center">
							{codeMakerName}: Set Your Secret Code
						</h3>
						<div className="flex justify-center gap-4">
							{secretCode.map((color, index) => (
								<div
									key={index}
									onClick={() => handleSecretCodeSlotClick(index)}
									className="relative border-4 border-purple-500 rounded-full w-12 h-12 cursor-pointer hover:border-purple-700 flex items-center justify-center"
								>
									{color && <PegPiece color={color} />}
								</div>
							))}
						</div>
					</div>
				)}

				<div className="flex gap-2 flex-col w-full">
					{/* CodeMaker controls */}
					{gameStatus === "settingSecret" && (
						<Button
							onClick={confirmSecretCode}
							className="bg-purple-600 hover:bg-purple-700"
						>
							Confirm Secret Code
						</Button>
					)}

					{gameStatus === "playing" && currentPlayer === "codemaker" && (
						<>
							<Button
								onClick={() => setSecretCodeDialogOpen(true)}
								variant="outline"
								className="bg-purple-500 text-white hover:bg-purple-600"
							>
								View Secret Code
							</Button>
							<Button
								onClick={submitFeedback}
								className="bg-purple-600 hover:bg-purple-700"
							>
								Submit Feedback
							</Button>
						</>
					)}

					{/* CodeBreaker controls */}
					{gameStatus === "playing" && currentPlayer === "codebreaker" && (
						<Button
							onClick={submitGuess}
							disabled={guesses[currentRow].isSubmitted}
							className="bg-blue-600 hover:bg-blue-700 w-full"
						>
							Submit Guess
						</Button>
					)}

					{/* Reset button */}
					{(gameStatus === "won" || gameStatus === "lost") && (
						<Button
							onClick={resetGame}
							className="bg-green-600 hover:bg-green-700"
						>
							New Game
						</Button>
					)}
				</div>
			</div>

			{/* Color Selection Dialog */}
			<ColorSelectionDialog
				open={colorDialogOpen}
				onOpenChange={setColorDialogOpen}
				colors={
					dialogPlayerType === "codebreaker"
						? CodeBreakerPegColors
						: CodeMakerPegColors
				}
				onSelectColor={handleColorSelection}
				position={selectedPosition}
				playerType={dialogPlayerType}
			/>

			{/* Secret Code Dialog */}
			<SecretCodeDialog
				open={secretCodeDialogOpen}
				onOpenChange={setSecretCodeDialogOpen}
				secretCode={secretCode}
				currentTurn={currentRow}
			/>

			{gameStatus !== "playing" && gameStatus !== "settingSecret" && (
				<div className="p-4 bg-white rounded shadow-lg z-10 text-center">
					<p className="text-lg font-bold">
						{gameStatus === "won"
							? `🎉 ${codeBreakerName} Won!`
							: `😔 ${codeMakerName} Won!`}
					</p>
					<p className="text-sm">
						Secret code: {secretCode.filter((c) => c).join(", ")}
					</p>
				</div>
			)}

			{/* Game Board */}
			{gameStatus === "playing" && (
				<div className="custom-board-shadow relative bg-secondary flex-1 rounded-2xl p-3 md:p-6 lg:p-8">
					{/* Secret Code Row - Only visible during setup */}

					{/* Game status */}

					{/* game layout */}
					<div className="w-full h-full flex justify-center items-center gap-2">
						{/* left panel */}
						<div className="h-full w-10/12">
							{/* 10 rows of slots */}
							<div className="h-full w-full flex flex-col justify-between items-center">
								{Array.from({ length: 10 }).map((_, rowIndex) => (
									<div
										key={rowIndex}
										className={`relative w-full flex justify-between items-center border-b-2 nth-[10]:border-none border-black h-1/10 ${
											rowIndex === currentRow &&
											gameStatus === "playing" &&
											currentPlayer === "codebreaker"
												? "bg-accent-c"
												: ""
										}`}
									>
										{Array.from({ length: 4 }).map((_, slotIndex) => (
											<div
												key={`${rowIndex}-${slotIndex}`}
												onClick={() =>
													handleCodebreakerSlotClick(rowIndex, slotIndex)
												}
												className={`border-2 border-black rounded-full w-6 h-6 relative ${
													rowIndex === currentRow &&
													!guesses[rowIndex].isSubmitted &&
													currentPlayer === "codebreaker"
														? "cursor-pointer hover:border-blue-500"
														: ""
												}`}
											>
												{guesses[rowIndex].pegs[slotIndex] && (
													<PegPiece
														color={guesses[rowIndex].pegs[slotIndex]!}
													/>
												)}
											</div>
										))}
									</div>
								))}
							</div>
						</div>

						{/* separator in the middle */}
						<div className="w-1 h-full border-l-2 border-black" />

						{/* right panel */}
						<div className="h-full w-2/4 flex flex-col justify-between items-center">
							{Array.from({ length: 10 }).map((_, rowIndex) => (
								<div
									key={rowIndex}
									className={`relative w-full grid grid-cols-2 border-b-2 nth-[10]:border-none border-black h-1/10 ${
										rowIndex === currentRow &&
										gameStatus === "playing" &&
										currentPlayer === "codemaker"
											? "bg-accent-c"
											: ""
									}`}
								>
									{Array.from({ length: 4 }).map((_, slotIndex) => (
										<div
											key={`${rowIndex}-${slotIndex}`}
											className={`border-2 border-black rounded-full w-6 h-6 relative col-span-1 m-auto ${
												rowIndex === currentRow &&
												currentPlayer === "codemaker" &&
												guesses[rowIndex].isSubmitted
													? "cursor-pointer hover:border-purple-500"
													: ""
											}`}
											onClick={() =>
												handleCodeMakerSlotClick(rowIndex, slotIndex)
											}
										>
											{guesses[rowIndex].feedback[slotIndex] && (
												<PegPiece
													color={guesses[rowIndex].feedback[slotIndex]!}
												/>
											)}
										</div>
									))}
								</div>
							))}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

const PegPiece = ({ color }: { color?: string }) => {
	console.log("🚀 ~ PegPiece ~ color:", color);

	return (
		<div
			className="absolute inset-0 m-auto rounded-full w-full h-full"
			style={{ backgroundColor: color }}
		></div>
	);
};

export default GameBoard;
