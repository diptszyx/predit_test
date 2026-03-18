import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { chatService } from "../../services/chat.service";
import { HomePage } from "../HomePage";
import { Sidebar } from "../Sidebar";

const HomeWrapper = ({
  commonSidebarProps,
  setWalletDialogOpen,
  setInitialPrompt,
  selectedAIAgent,
  listOracles,
  setSelectedAIAgent,
  commonDialogProps,
  user
}: any) => {
  const navigate = useNavigate()

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Helmet>
        <title>
          AI-Powered Market Predictions | Predit Market AI Oracles
          Platform
        </title>
        <meta
          name="description"
          content="AI-powered market predictions and expert insights from specialized AI oracles. Get predictions for crypto, tech, politics, sports, and financial markets with our AI agents platform."
        />
        <meta
          name="keywords"
          content="AI-powered predictions, AI oracles, market predictions, cryptocurrency predictions, tech predictions, sports predictions, AI agents, financial market analysis"
        />
        <meta
          property="og:title"
          content="AI-Powered Market Predictions | Predit Market AI Oracles Platform"
        />
        <meta
          property="og:description"
          content="AI-powered market predictions and expert insights from specialized AI oracles. Get predictions for crypto, tech, politics, and financial markets."
        />
        <meta
          property="og:type"
          content="website"
        />
        <meta
          name="twitter:card"
          content="summary_large_image"
        />
        <meta
          name="twitter:title"
          content="AI-Powered Market Predictions | Predit Market AI Oracles Platform"
        />
        <meta
          name="twitter:description"
          content="AI-powered market predictions and expert insights from specialized AI oracles. Get predictions for crypto, tech, politics, and financial markets."
        />
        <link
          rel="canonical"
          href={window.location.origin}
        />
      </Helmet>

      <Sidebar {...commonSidebarProps} />
      <div className="flex-1 overflow-y-auto">
        <HomePage
          onGetStarted={() => setWalletDialogOpen(true)}
          onExplorePredictions={(prompt) => {
            if (prompt) {
              setInitialPrompt(prompt);
            }
            const handlePredictionNav = async () => {
              let targetAgent = selectedAIAgent;
              if (!targetAgent && listOracles.length > 0) {
                targetAgent = listOracles[0];
                localStorage.setItem(
                  'deor-currentOracle',
                  listOracles[0].id,
                );
                setSelectedAIAgent(listOracles[0]);
              }

              if (targetAgent) {
                const newChat = await chatService.createChat();
                if (newChat) navigate(`/chat/${newChat.id}`);
              } else {
                navigate('/chat');
              }
            };
            handlePredictionNav();
          }}
          user={user}
        />
      </div>
      {commonDialogProps}
    </div>
  )
}

export default HomeWrapper
