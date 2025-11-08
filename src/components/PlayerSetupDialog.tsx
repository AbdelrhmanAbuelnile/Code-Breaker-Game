import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PlayerSetupDialogProps {
	open: boolean;
	onPlayersSet: (player1: string, player2: string) => void;
}

export function PlayerSetupDialog({
	open,
	onPlayersSet,
}: PlayerSetupDialogProps) {
	const [player1Name, setPlayer1Name] = useState("");
	const [player2Name, setPlayer2Name] = useState("");

	const handleSubmit = () => {
		if (!player1Name.trim() || !player2Name.trim()) {
			alert("Please enter both player names!");
			return;
		}
		onPlayersSet(player1Name.trim(), player2Name.trim());
	};

	return (
		<Dialog open={open} onOpenChange={() => {}}>
			<DialogContent
				className="sm:max-w-md"
				onPointerDownOutside={(e) => e.preventDefault()}
			>
				<DialogHeader>
					<DialogTitle>Welcome to Mastermind!</DialogTitle>
					<DialogDescription>
						Enter player names to begin the game
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium mb-2">
							Player 1 Name
						</label>
						<input
							type="text"
							value={player1Name}
							onChange={(e) => setPlayer1Name(e.target.value)}
							placeholder="Enter name..."
							className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
							onKeyDown={(e) => {
								if (e.key === "Enter") handleSubmit();
							}}
						/>
					</div>
					<div>
						<label className="block text-sm font-medium mb-2">
							Player 2 Name
						</label>
						<input
							type="text"
							value={player2Name}
							onChange={(e) => setPlayer2Name(e.target.value)}
							placeholder="Enter name..."
							className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
							onKeyDown={(e) => {
								if (e.key === "Enter") handleSubmit();
							}}
						/>
					</div>
					<Button
						onClick={handleSubmit}
						className="w-full bg-blue-600 hover:bg-blue-700"
					>
						Start Game
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
