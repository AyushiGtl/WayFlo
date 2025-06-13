mod api;
mod router;
mod types;

use actix_web::{App, HttpServer, middleware::Logger};
use actix_cors::Cors;
use std::fs::read_to_string;
use std::env;
use env_logger;
use types::Node;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));
    
    // Get port from environment variable or use default
    let port = env::var("PORT")
        .unwrap_or_else(|_| "7979".to_string())
        .parse::<u16>()
        .expect("PORT must be a number");

    let file = read_to_string("data/hotpoints.json").expect("Failed to read map.json");
    let map: Vec<Node> = serde_json::from_str(&file).expect("Invalid JSON");
    
    println!("Starting server on port: {}", port);
    
    HttpServer::new(move || {
        let cors = Cors::default()
            .allow_any_origin()
            .allow_any_method()
            .allow_any_header();

        App::new()
            .wrap(Logger::default())
            .wrap(cors)
            .app_data(actix_web::web::Data::new(map.clone()))
            .service(api::route)
    })
    .bind(("0.0.0.0", port))?
    .run()
    .await
}
