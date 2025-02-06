from flask import Flask, render_template

app = Flask(__name__)

default_criteria = {
    'looks_and_physical_appearance': 25,
    'personality_character': 25,
    'intelligence_wit': 20,
    'emotional_stability': 15,
    'social_skills': 15
}

@app.route('/')
def index():
      return render_template('index.html', criteria=default_criteria)

if __name__ == '__main__':
    app.run(debug=True)
