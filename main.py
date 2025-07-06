from typing import Annotated
from typing_extensions import TypedDict
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langchain_ollama import ChatOllama
from langchain_core.messages import HumanMessage
from langchain_community.tools import DuckDuckGoSearchRun
from langchain_core.tools import Tool
from langgraph.prebuilt import ToolNode, tools_condition

class State(TypedDict):
    messages: Annotated[list, add_messages]

graph_builder = StateGraph(State)

ddg = DuckDuckGoSearchRun()
search_tool = Tool(name="duckduckgo_search", func=ddg.run, description="Use this tool to search the web for real-time information,"
                                                                       " such as weather, current events, or facts you do not know. "
                                                                       "Be specific with your search query. Do not use this tool to "
                                                                       "answer basic questions that have well-defined answers. In case"
                                                                       "of uncertainty, fallback to this tool and search the web.")

llm = ChatOllama(model="llama3-groq-tool-use:8b").bind_tools([search_tool])

def chatbot(state: State):
    # ChatOllama's invoke method returns a message object (e.g., AIMessage)
    response = llm.invoke(state["messages"])
    # Return a list containing the new message to be appended to the state
    return {"messages": [response]}

graph_builder.add_node("chatbot", chatbot)

tool_node = ToolNode(tools=[search_tool])
graph_builder.add_node("tools", tool_node)

graph_builder.add_conditional_edges("chatbot", tools_condition)
graph_builder.add_edge("tools", "chatbot")
graph_builder.add_edge(START, "chatbot")

graph = graph_builder.compile()

def stream_graph_updates(user_input: str):
    for event in graph.stream({"messages": [HumanMessage(content=user_input)]}):
        for value in event.values():
            print("Assistant:", value["messages"][-1].content)

while True:
    try:
        user_input = input("User: ")
        if user_input.lower() in ["quit", "exit", "q"]:
            print("Goodbye!")
            break
        stream_graph_updates(user_input)
    except Exception as e:
        print("Error:", e)
        break