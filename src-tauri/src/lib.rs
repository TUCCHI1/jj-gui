use std::process::Command;
use std::env;
use std::time::{SystemTime, UNIX_EPOCH};

#[tauri::command]
fn get_jj_log(repo_path: Option<String>) -> Result<String, String> {
    let path = repo_path.unwrap_or_else(|| {
        env::var("HOME").unwrap_or_else(|_| ".".to_string())
    });

    // Use a structured template for easier parsing
    // Format: CHANGE_ID|BOOKMARKS|AUTHOR|DATE|DESCRIPTION|IS_WORKING|IS_IMMUTABLE
    let template = r#"concat(
        change_id.shortest(8),
        "|",
        bookmarks.map(|b| b.name()).join(" "),
        "|",
        author.email(),
        "|",
        committer.timestamp().format("%Y-%m-%d"),
        "|",
        description.first_line(),
        "|",
        if(self.current_working_copy(), "working", ""),
        "|",
        if(immutable, "immutable", ""),
        "\n"
    )"#;

    let output = Command::new("jj")
        .args(["log", "--no-graph", "--color=never", "-T", template, "-R", &path])
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        String::from_utf8(output.stdout).map_err(|e| e.to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

#[tauri::command]
fn take_screenshot() -> Result<String, String> {
    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|e| e.to_string())?
        .as_secs();

    let path = format!("/tmp/jj-gui-screenshot-{}.png", timestamp);

    // macOS screencapture: -w for window, -o to exclude shadow
    let output = Command::new("screencapture")
        .args(["-w", "-o", &path])
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        Ok(path)
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

#[tauri::command]
fn jj_describe(repo_path: String, revision: String, message: String) -> Result<String, String> {
    let output = Command::new("jj")
        .args(["describe", &revision, "-m", &message, "-R", &repo_path])
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![get_jj_log, jj_describe, take_screenshot])
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
